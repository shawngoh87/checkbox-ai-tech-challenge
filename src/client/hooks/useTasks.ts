import { useMutation, useQuery } from '@tanstack/react-query';
import { listTasks, createTask, updateTask, CreateTaskPayload, UpdateTaskPayload, ListTasksParams } from '../api/tasks';
import { useState, useRef, useCallback, useEffect } from 'react';
import { Task } from '../types/task';

interface ListTasksResponse {
  tasks: Task[];
  nextCursor?: string;
}

type SortStatus = {
  columnAccessor: string;
  direction: 'asc' | 'desc';
};

export function useTasks() {
  const [sortStatus, setSortStatus] = useState<SortStatus>({
    columnAccessor: 'created_at',
    direction: 'desc',
  });

  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string>('initial'); // Default cursor to "initial"
  const [allRecords, setAllRecords] = useState<Task[]>([]); // Stores accumulated tasks
  const scrollViewportRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, refetch } = useQuery<ListTasksResponse>({
    queryKey: ['tasks', sortStatus, cursor],
    queryFn: async () => {
      const params: ListTasksParams = {
        limit: 20,
        sort: `${sortStatus.columnAccessor}:${sortStatus.direction}`,
      };

      if (cursor !== 'initial') {
        params.cursor = cursor;
      }

      return listTasks(params);
    },
  });

  // Reset accumulated records when sortStatus changes
  useEffect(() => {
    setCursor('initial');
    setAllRecords([]);
  }, [sortStatus]);

  // Accumulate records when data changes
  useEffect(() => {
    if (data?.tasks) {
      setAllRecords((prevRecords) => [...prevRecords, ...data.tasks]);
      setHasMore(!!data.nextCursor);
    }
  }, [data]);

  const loadMoreRecords = useCallback(() => {
    if (hasMore && !isLoading && data?.nextCursor) {
      setCursor(data.nextCursor);
    }
  }, [hasMore, isLoading, data?.nextCursor]);

  useEffect(() => {
    refetch();
  }, [cursor, refetch]);

  const createTaskMutation = useMutation({
    mutationFn: (newTask: CreateTaskPayload) => createTask(newTask),
    onSuccess: () => {
      setCursor('initial'); // Reset pagination
      setHasMore(true);
      setAllRecords([]); // Reset tasks
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskPayload }) => updateTask(id, data),
    onSuccess: () => {
      setCursor('initial'); // Reset pagination
      setAllRecords([]); // Reset tasks
    },
  });

  return {
    records: allRecords,
    loading: isLoading,
    hasMore,
    createTask: createTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    sortStatus,
    setSortStatus,
    loadMoreRecords,
    scrollViewportRef,
  };
}

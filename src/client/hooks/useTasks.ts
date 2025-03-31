import { useMutation } from '@tanstack/react-query';
import { listTasks, createTask, updateTask, CreateTaskPayload, UpdateTaskPayload, ListTasksParams } from '../api/tasks';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Task } from '../types/task';

export function useTasks() {
  const [records, setRecords] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [sortStatus, setSortStatus] = useState<{ columnAccessor: string; direction: 'asc' | 'desc' }>({
    columnAccessor: 'created_at',
    direction: 'desc',
  });
  const scrollViewportRef = useRef<HTMLDivElement>(null);

  const loadMoreRecords = useCallback(async () => {
    if (!hasMore || loading) return;

    setLoading(true);
    try {
      const params: ListTasksParams = {
        limit: 10,
        sort: `${sortStatus.columnAccessor}:${sortStatus.direction}`,
      };

      if (records.length > 0 && nextCursor) {
        params.cursor = nextCursor;
      }

      const response = await listTasks(params);

      if (response.tasks.length === 0) {
        setHasMore(false);
        return;
      }

      if (records.length === 0) {
        setRecords(response.tasks);
      } else {
        setRecords((prev) => [...prev, ...response.tasks]);
      }
      setNextCursor(response.nextCursor);
    } catch (error) {
      throw new Error('Failed to load more tasks');
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, nextCursor, sortStatus]);

  useEffect(() => {
    setSortStatus({ columnAccessor: 'created_at', direction: 'desc' });
  }, []);

  useEffect(() => {
    if (records.length === 0 && hasMore && nextCursor === undefined) {
      loadMoreRecords();
    }
  }, [records, hasMore, nextCursor, loadMoreRecords]);

  useEffect(() => {
    setRecords([]);
    setHasMore(true);
    setNextCursor(undefined);
  }, [sortStatus]);

  const createTaskMutation = useMutation({
    mutationFn: (newTask: CreateTaskPayload) => createTask(newTask),
    onSuccess: () => {
      setRecords([]);
      setHasMore(true);
      setNextCursor(undefined);
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskPayload }) => updateTask(id, data),
    onSuccess: () => {
      setRecords([]);
      setHasMore(true);
      setNextCursor(undefined);
    },
  });

  return {
    records,
    loading,
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

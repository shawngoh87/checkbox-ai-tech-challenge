import { Task, TaskStatus } from '../types/task';
import { Text, Badge, Paper, Group, Select, Button } from '@mantine/core';
import { DataTable } from 'mantine-datatable';
import { format } from 'date-fns';
import { useState } from 'react';
import { EditTaskModal } from './EditTaskModal';

interface TaskListProps {
  records: Task[];
  onUpdateTask: (id: string, data: { name?: string; description?: string; dueAt?: string; version: number }) => void;
  loading: boolean;
  isUpdating?: boolean;
  hasMore: boolean;
  sortStatus: { columnAccessor: string; direction: 'asc' | 'desc' };
  onSortStatusChange: (status: { columnAccessor: string; direction: 'asc' | 'desc' }) => void;
  onLoadMore: () => void;
  scrollViewportRef: React.RefObject<HTMLDivElement>;
  error?: unknown;
  failureCount?: number;
  onRetry?: () => void;
}

const getStatusColor = (status: TaskStatus) => {
  switch (status) {
    case TaskStatus.OVERDUE:
      return 'red';
    case TaskStatus.DUE_SOON:
      return 'yellow';
    case TaskStatus.NOT_URGENT:
      return 'green';
  }
};

const SORT_OPTIONS = [
  { value: 'created_at:desc', label: 'Created date, descending' },
  { value: 'created_at:asc', label: 'Created date, ascending' },
  { value: 'due_at:desc', label: 'Due date, descending' },
  { value: 'due_at:asc', label: 'Due date, ascending' },
];

export function TaskList({
  records,
  onUpdateTask,
  loading,
  isUpdating,
  hasMore,
  sortStatus,
  onSortStatusChange,
  onLoadMore,
  scrollViewportRef,
  failureCount,
  onRetry,
}: TaskListProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleSortChange = (value: string | null) => {
    if (!value) return;
    const [columnAccessor, direction] = value.split(':') as [string, 'asc' | 'desc'];
    onSortStatusChange({ columnAccessor, direction });
  };

  const handleRowClick = (record: Task) => {
    setSelectedTask(record);
    setIsEditModalOpen(true);
  };

  if (failureCount && failureCount >= 3) {
    return (
      <Paper p="xl" withBorder>
        <Group justify="center">
          <Text>Something went wrong</Text>
          <Button onClick={onRetry} variant="light" color="blue">
            Refresh
          </Button>
        </Group>
      </Paper>
    );
  }

  return (
    <div data-testid="task-list">
      <Group mb="md" justify="flex-end">
        <Select
          w={300}
          label="Sort by"
          placeholder="Select sort option"
          data={SORT_OPTIONS}
          value={`${sortStatus.columnAccessor}:${sortStatus.direction}`}
          onChange={handleSortChange}
        />
      </Group>

      <DataTable
        withTableBorder
        borderRadius="sm"
        withColumnBorders
        striped
        highlightOnHover
        records={records}
        columns={[
          {
            accessor: 'name',
            title: 'Name',
            width: '20%',
            render: ({ name }) => <div data-testid="task-name">{name}</div>,
          },
          {
            accessor: 'description',
            title: 'Description',
            width: '30%',
            render: ({ description }) => <div data-testid="task-description">{description}</div>,
          },
          {
            accessor: 'status',
            title: 'Status',
            width: '15%',
            render: ({ status }) => {
              const color = getStatusColor(status);
              return (
                <Badge data-testid="task-status" color={color}>
                  {status.replace('_', ' ')}
                </Badge>
              );
            },
          },
          {
            accessor: 'due_at',
            title: 'Due Date',
            width: '17.5%',
            render: ({ dueAt }) => (
              <Text data-testid="task-due-at" size="sm">
                {format(new Date(dueAt), 'dd MMM yyyy')}
              </Text>
            ),
          },
          {
            accessor: 'created_at',
            title: 'Created',
            width: '17.5%',
            render: ({ createdAt }) => (
              <Text data-testid="task-created-at" size="sm">
                {format(new Date(createdAt), 'dd MMM yyyy')}
              </Text>
            ),
          },
        ]}
        noRecordsText="No tasks found. Create a new task to get started."
        minHeight={200}
        height={400}
        fetching={loading}
        onScrollToBottom={onLoadMore}
        scrollViewportRef={scrollViewportRef}
        defaultColumnProps={{
          sortable: false,
        }}
        onRowClick={({ record }) => handleRowClick(record)}
      />

      <Paper p="md" mt="sm" withBorder>
        <Group justify="space-between">
          <Text size="sm">
            Showing {records.length} records
            {hasMore && ', scroll to bottom to load more'}
          </Text>
        </Group>
      </Paper>

      <EditTaskModal
        task={selectedTask}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTask(null);
        }}
        onUpdateTask={onUpdateTask}
        isUpdating={isUpdating}
      />
    </div>
  );
}

import { Task, TaskStatus } from '../types/task';
import { Text, Badge, Loader, Center } from '@mantine/core';
import { DataTable } from 'mantine-datatable';
import { format } from 'date-fns';
import { useState } from 'react';
import { EditTaskModal } from './EditTaskModal';

interface TaskListProps {
  tasks: Task[];
  onUpdateTask: (id: string, data: { name?: string; description?: string; dueAt?: string; version: number }) => void;
  isLoading: boolean;
  isUpdating?: boolean;
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

export function TaskList({ tasks, onUpdateTask, isLoading, isUpdating }: TaskListProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (isLoading) {
    return (
      <Center h={200} data-testid="task-list-loading">
        <Loader size="lg" />
      </Center>
    );
  }

  const handleRowClick = (record: Task) => {
    setSelectedTask(record);
    setIsEditModalOpen(true);
  };

  return (
    <div data-testid="task-list">
      <DataTable
        withTableBorder
        borderRadius="sm"
        withColumnBorders
        striped
        highlightOnHover
        records={tasks}
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
            accessor: 'createdAt',
            title: 'Created',
            width: '17.5%',
            render: ({ createdAt }) => (
              <Text data-testid="task-created-at" size="sm">
                {format(new Date(createdAt), 'PPP')}
              </Text>
            ),
          },
          {
            accessor: 'dueAt',
            title: 'Due Date',
            width: '17.5%',
            render: ({ dueAt }) => (
              <Text data-testid="task-due-at" size="sm">
                {format(new Date(dueAt), 'PPP')}
              </Text>
            ),
          },
        ]}
        noRecordsText="No tasks found. Create a new task to get started."
        minHeight={200}
        sortStatus={{ columnAccessor: 'dueAt', direction: 'asc' }}
        defaultColumnProps={{
          sortable: true,
        }}
        onRowClick={({ record }) => handleRowClick(record)}
      />

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

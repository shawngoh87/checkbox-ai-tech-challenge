import { TaskList } from '../components/TaskList';
import { CreateTaskModal } from '../components/CreateTaskModal';
import { useTasks } from '../hooks/useTasks';
import { Button } from '@mantine/core';
import { useState } from 'react';

export function TasksPage() {
  const {
    records,
    loading,
    createTask,
    updateTask,
    isCreating,
    sortStatus,
    setSortStatus,
    loadMoreRecords,
    scrollViewportRef,
    hasMore,
  } = useTasks();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div data-testid="tasks-page">
      <h1>Task Management</h1>

      <Button onClick={() => setIsCreateModalOpen(true)} mb="md" data-testid="create-task-button">
        Create New Task
      </Button>

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateTask={createTask}
        isCreating={isCreating}
      />

      <TaskList
        records={records}
        onUpdateTask={(id, data) => updateTask({ id, data })}
        loading={loading}
        sortStatus={sortStatus}
        onSortStatusChange={setSortStatus}
        onLoadMore={loadMoreRecords}
        scrollViewportRef={scrollViewportRef}
        hasMore={hasMore}
      />
    </div>
  );
}

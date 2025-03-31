import { Modal } from '@mantine/core';
import { CreateTaskForm } from './CreateTaskForm';
import { CreateTaskPayload } from '../api/tasks';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (task: CreateTaskPayload) => void;
  isCreating: boolean;
}

export function CreateTaskModal({ isOpen, onClose, onCreateTask, isCreating }: CreateTaskModalProps) {
  const handleCreateTask = (task: CreateTaskPayload) => {
    onCreateTask(task);
    onClose();
  };

  return (
    <Modal opened={isOpen} onClose={onClose} title="Create New Task" centered>
      <CreateTaskForm onCreateTask={handleCreateTask} isCreating={isCreating} />
    </Modal>
  );
}

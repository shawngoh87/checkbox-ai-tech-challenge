import { useState, useEffect } from 'react';
import { Modal, TextInput, Textarea, Button, Stack } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { Task } from '../types/task';

interface EditTaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (id: string, data: { name?: string; description?: string; dueAt?: string; version: number }) => void;
  isUpdating?: boolean;
}

export function EditTaskModal({ task, isOpen, onClose, onUpdateTask, isUpdating = false }: EditTaskModalProps) {
  const [name, setName] = useState(task?.name ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [dueAt, setDueAt] = useState<Date | null>(task?.dueAt ? new Date(task.dueAt) : null);

  useEffect(() => {
    if (task) {
      setName(task.name);
      setDescription(task.description);
      setDueAt(new Date(task.dueAt));
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !dueAt) return;

    onUpdateTask(task.id, {
      name,
      description,
      dueAt: dueAt.toISOString(),
      version: task.version,
    });
    onClose();
  };

  return (
    <Modal opened={isOpen} onClose={onClose} title="Edit Task" centered>
      <form onSubmit={handleSubmit}>
        <Stack>
          <TextInput
            label="Task Name"
            placeholder="Enter task name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            data-testid="edit-task-name"
          />
          <Textarea
            label="Description"
            placeholder="Enter task description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            minRows={3}
            data-testid="edit-task-description"
          />
          <DateInput
            label="Due Date"
            placeholder="Select due date"
            value={dueAt}
            onChange={setDueAt}
            required
            data-testid="edit-task-due-date"
          />
          <Button type="submit" loading={isUpdating}>
            {isUpdating ? 'Updating...' : 'Update Task'}
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}

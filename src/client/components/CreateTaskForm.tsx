import { useState } from 'react';
import { CreateTaskPayload } from '../api/tasks';
import { TextInput, Textarea, Button, Paper, Title, Stack } from '@mantine/core';
import { DateInput } from '@mantine/dates';

interface CreateTaskFormProps {
  onCreateTask: (task: CreateTaskPayload) => void;
  isCreating: boolean;
}

export function CreateTaskForm({ onCreateTask, isCreating }: CreateTaskFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dueAt, setDueAt] = useState<Date | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dueAt) return;

    onCreateTask({
      name,
      description,
      dueAt: dueAt.toISOString(),
    });

    // Reset form
    setName('');
    setDescription('');
    setDueAt(null);
  };

  return (
    <Paper withBorder p="md" radius="md" data-testid="create-task-form">
      <Title order={2} mb="md">
        Create New Task
      </Title>
      <form onSubmit={handleSubmit}>
        <Stack>
          <TextInput
            label="Task Name"
            placeholder="Enter task name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            data-testid="task-name"
          />
          <Textarea
            label="Description"
            placeholder="Enter task description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            minRows={3}
            data-testid="task-description"
          />
          <DateInput
            label="Due Date"
            placeholder="Select due date"
            value={dueAt}
            onChange={setDueAt}
            required
            data-testid="task-due-date"
          />
          <Button type="submit" loading={isCreating}>
            {isCreating ? 'Creating...' : 'Create Task'}
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}

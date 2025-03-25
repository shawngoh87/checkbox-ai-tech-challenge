import { useState } from 'react';
import { CreateTaskPayload } from '../api/tasks';

interface CreateTaskFormProps {
  onCreateTask: (task: CreateTaskPayload) => void;
  isCreating: boolean;
}

export function CreateTaskForm({ onCreateTask, isCreating }: CreateTaskFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onCreateTask({
      name,
      description,
      dueDate: new Date(`${dueDate}T00:00:00`).toISOString(),
    });

    // Reset form
    setName('');
    setDescription('');
    setDueDate('');
  };

  return (
    <div data-testid="create-task-form">
      <h2>Create New Task</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="task-name">Name:</label>
          <input id="task-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="task-description">Description:</label>
          <textarea
            id="task-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="task-due-date">Due Date:</label>
          <input id="task-due-date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
        </div>
        <div>
          <button type="submit" disabled={isCreating}>
            {isCreating ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
}

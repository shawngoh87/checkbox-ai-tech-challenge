import { Task } from '../types/task';

interface TaskListProps {
  tasks: Task[];
  onUpdateTask: (id: string, data: { name?: string; description?: string; dueAt?: string }) => void;
  isLoading: boolean;
}

export function TaskList({ tasks, isLoading }: TaskListProps) {
  if (isLoading) {
    return <div data-testid="task-list-loading">Loading tasks...</div>;
  }

  if (tasks.length === 0) {
    return <div data-testid="task-list-empty">No tasks found. Create a new task to get started.</div>;
  }

  return (
    <div data-testid="task-list">
      <h2>Tasks</h2>
      {tasks.map((task) => (
        <div key={task.id} data-testid={`task-card-${task.id}`}>
          <h3>{task.name}</h3>
          <p>{task.description}</p>
          <p>{task.dueAt}</p>
        </div>
      ))}
    </div>
  );
}

import { TaskList } from '../components/TaskList';
import { CreateTaskForm } from '../components/CreateTaskForm';
import { useTasks } from '../hooks/useTasks';

export function TasksPage() {
  const { tasks, isLoading, createTask, updateTask, isCreating } = useTasks();

  return (
    <div data-testid="tasks-page">
      <h1>Task Management</h1>

      <CreateTaskForm onCreateTask={createTask} isCreating={isCreating} />

      <TaskList tasks={tasks} onUpdateTask={(id, data) => updateTask({ id, data })} isLoading={isLoading} />
    </div>
  );
}

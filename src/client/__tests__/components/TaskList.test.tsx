import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TaskList } from '../../components/TaskList';
import { Task, TaskStatus } from '../../types/task';

vi.mock('../../components/TaskCard', () => ({
  TaskCard: ({ task }: { task: Task }) => <div data-testid={`task-card-${task.id}`}>{task.name}</div>,
}));

describe('TaskList', () => {
  const mockTasks: Task[] = [
    {
      id: '1',
      name: 'Task 1',
      description: 'Description 1',
      dueAt: '2023-05-01T00:00:00.000Z',
      createdAt: '2023-04-01T00:00:00.000Z',
      status: TaskStatus.NOT_URGENT,
    },
    {
      id: '2',
      name: 'Task 2',
      description: 'Description 2',
      dueAt: '2023-04-05T00:00:00.000Z',
      createdAt: '2023-04-02T00:00:00.000Z',
      status: TaskStatus.DUE_SOON,
    },
  ];

  const mockOnUpdateTask = vi.fn();

  it('displays loading state when isLoading is true', () => {
    render(<TaskList tasks={[]} onUpdateTask={mockOnUpdateTask} isLoading={true} />);

    expect(screen.getByTestId('task-list-loading')).toBeInTheDocument();
    expect(screen.getByText('Loading tasks...')).toBeInTheDocument();
  });

  it('displays empty state when there are no tasks', () => {
    render(<TaskList tasks={[]} onUpdateTask={mockOnUpdateTask} isLoading={false} />);

    expect(screen.getByTestId('task-list-empty')).toBeInTheDocument();
    expect(screen.getByText('No tasks found. Create a new task to get started.')).toBeInTheDocument();
  });

  it('renders task cards for each task', () => {
    render(<TaskList tasks={mockTasks} onUpdateTask={mockOnUpdateTask} isLoading={false} />);

    expect(screen.getByTestId('task-list')).toBeInTheDocument();
    expect(screen.getByText('Tasks')).toBeInTheDocument();

    expect(screen.getByTestId('task-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('task-card-2')).toBeInTheDocument();
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
  });
});

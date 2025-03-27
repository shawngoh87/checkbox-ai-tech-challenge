import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MantineProvider } from '@mantine/core';
import { TaskList } from '../../components/TaskList';
import { Task, TaskStatus } from '../../types/task';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MantineProvider>{ui}</MantineProvider>
    </QueryClientProvider>,
  );
};

describe('TaskList', () => {
  const mockTasks: Task[] = [
    {
      id: '1',
      name: 'Task 1',
      description: 'Description 1',
      dueAt: '2023-05-01T00:00:00.000Z',
      createdAt: '2023-04-01T00:00:00.000Z',
      status: TaskStatus.NOT_URGENT,
      version: 1,
    },
    {
      id: '2',
      name: 'Task 2',
      description: 'Description 2',
      dueAt: '2023-04-05T00:00:00.000Z',
      createdAt: '2023-04-02T00:00:00.000Z',
      status: TaskStatus.DUE_SOON,
      version: 1,
    },
  ];

  const mockOnUpdateTask = vi.fn();

  it('displays loading state when isLoading is true', () => {
    renderWithProviders(<TaskList tasks={[]} onUpdateTask={mockOnUpdateTask} isLoading={true} />);

    expect(screen.getByTestId('task-list-loading')).toBeInTheDocument();
    expect(screen.getByTestId('task-list-loading').querySelector('.mantine-Loader-root')).toBeInTheDocument();
  });

  it('displays empty state when there are no tasks', () => {
    renderWithProviders(<TaskList tasks={[]} onUpdateTask={mockOnUpdateTask} isLoading={false} />);

    expect(screen.getByText('No tasks found. Create a new task to get started.')).toBeInTheDocument();
  });

  it('renders tasks in the table', async () => {
    renderWithProviders(<TaskList tasks={mockTasks} onUpdateTask={mockOnUpdateTask} isLoading={false} />);

    const table = await screen.findByRole('table');
    expect(table).toBeInTheDocument();

    const rows = await screen.findAllByRole('row');
    expect(rows).toHaveLength(3);

    const taskRows = rows.slice(1);
    expect(taskRows).toHaveLength(2);
  });
});

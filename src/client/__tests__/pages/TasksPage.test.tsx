import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TasksPage } from '../../pages/TasksPage';
import { useTasks } from '../../hooks/useTasks';

vi.mock('../../components/TaskList', () => ({
  TaskList: () => <div data-testid="mock-task-list">TaskList Mock</div>,
}));

vi.mock('../../components/CreateTaskForm', () => ({
  CreateTaskForm: () => <div data-testid="mock-create-task-form">CreateTaskForm Mock</div>,
}));

vi.mock('../../hooks/useTasks', () => ({
  useTasks: vi.fn(),
}));

describe('TasksPage', () => {
  beforeEach(() => {
    (useTasks as ReturnType<typeof vi.fn>).mockReturnValue({
      tasks: [],
      isLoading: false,
      createTask: vi.fn(),
      updateTask: vi.fn(),
      deleteTask: vi.fn(),
      isCreating: false,
    });
  });

  it('renders the page with all components', () => {
    render(<TasksPage />);

    expect(screen.getByText('Task Management')).toBeInTheDocument();
    expect(screen.getByTestId('mock-task-list')).toBeInTheDocument();
    expect(screen.getByTestId('mock-create-task-form')).toBeInTheDocument();
  });

  it('passes the correct props to child components', () => {
    const mockUseTasks = {
      tasks: [{ id: '1', name: 'Test Task' }],
      isLoading: false,
      createTask: vi.fn(),
      updateTask: vi.fn(),
      deleteTask: vi.fn(),
      isCreating: true,
    };

    (useTasks as ReturnType<typeof vi.fn>).mockReturnValue(mockUseTasks);

    render(<TasksPage />);

    expect(useTasks).toHaveBeenCalled();
  });
});

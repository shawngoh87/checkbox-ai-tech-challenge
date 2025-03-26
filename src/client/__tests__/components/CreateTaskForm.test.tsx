import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CreateTaskForm } from '../../components/CreateTaskForm';

describe('CreateTaskForm', () => {
  const mockOnCreateTask = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form correctly', () => {
    render(<CreateTaskForm onCreateTask={mockOnCreateTask} isCreating={false} />);

    expect(screen.getByLabelText(/Name:/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description:/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Due Date:/)).toBeInTheDocument();
    expect(screen.getByText('Create Task')).toBeInTheDocument();
  });

  it('submits the form with task data', () => {
    render(<CreateTaskForm onCreateTask={mockOnCreateTask} isCreating={false} />);

    fireEvent.change(screen.getByLabelText(/Name:/), {
      target: { value: 'New Test Task' },
    });
    fireEvent.change(screen.getByLabelText(/Description:/), {
      target: { value: 'New Test Description' },
    });
    fireEvent.change(screen.getByLabelText(/Due Date:/), {
      target: { value: '2023-06-01' },
    });

    const form = screen.getByTestId('create-task-form').querySelector('form');
    fireEvent.submit(form!);

    expect(mockOnCreateTask).toHaveBeenCalledWith({
      name: 'New Test Task',
      description: 'New Test Description',
      dueAt: expect.any(String),
    });

    expect(screen.getByLabelText(/Name:/)).toHaveValue('');
    expect(screen.getByLabelText(/Description:/)).toHaveValue('');
    expect(screen.getByLabelText(/Due Date:/)).toHaveValue('');
  });

  it('disables the submit button when isCreating is true', () => {
    render(<CreateTaskForm onCreateTask={mockOnCreateTask} isCreating={true} />);

    expect(screen.getByText('Creating...')).toBeDisabled();
  });
});

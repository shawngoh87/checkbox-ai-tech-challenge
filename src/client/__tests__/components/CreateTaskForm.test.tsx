import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MantineProvider } from '@mantine/core';
import { CreateTaskForm } from '../../components/CreateTaskForm';

const renderWithProviders = (ui: React.ReactElement) => {
  return render(<MantineProvider>{ui}</MantineProvider>);
};

describe('CreateTaskForm', () => {
  const mockOnCreateTask = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form correctly', () => {
    renderWithProviders(<CreateTaskForm onCreateTask={mockOnCreateTask} isCreating={false} />);

    expect(screen.getByLabelText(/Task Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Due Date/)).toBeInTheDocument();
    expect(screen.getByText('Create Task')).toBeInTheDocument();
  });

  it('submits the form with task data', () => {
    renderWithProviders(<CreateTaskForm onCreateTask={mockOnCreateTask} isCreating={false} />);

    fireEvent.change(screen.getByLabelText(/Task Name/), {
      target: { value: 'New Test Task' },
    });
    fireEvent.change(screen.getByLabelText(/Description/), {
      target: { value: 'New Test Description' },
    });

    const dateInput = screen.getByLabelText(/Due Date/);
    fireEvent.change(dateInput, { target: { value: '2023-06-01' } });
    fireEvent.blur(dateInput);

    const form = screen.getByTestId('create-task-form').querySelector('form');
    fireEvent.submit(form!);

    expect(mockOnCreateTask).toHaveBeenCalledWith({
      name: 'New Test Task',
      description: 'New Test Description',
      dueAt: expect.any(String),
    });

    expect(screen.getByLabelText(/Task Name/)).toHaveValue('');
    expect(screen.getByLabelText(/Description/)).toHaveValue('');
  });

  it('disables the submit button when isCreating is true', () => {
    renderWithProviders(<CreateTaskForm onCreateTask={mockOnCreateTask} isCreating={true} />);

    const button = screen.getByRole('button', { name: /Creating.../ });
    expect(button).toHaveAttribute('data-loading');
  });
});

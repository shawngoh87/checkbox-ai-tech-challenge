import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTasks } from '../../hooks/useTasks';
import * as taskApi from '../../api/tasks';

// TODO: Mock current date
vi.mock('../../api/tasks', () => ({
  listTasks: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
}));

const mockTasks = [
  {
    id: '1',
    name: 'Task 1',
    description: 'Description 1',
    dueAt: '2025-05-01T00:00:00.000Z', // Further in future
    createdAt: '2025-04-01T00:00:00.000Z',
    status: 'NOT_URGENT',
  },
  {
    id: '2',
    name: 'Task 2',
    description: 'Description 2',
    dueAt: '2025-04-05T00:00:00.000Z', // Sooner
    createdAt: '2025-04-02T00:00:00.000Z',
    status: 'DUE_SOON',
  },
];

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useTasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (taskApi.listTasks as ReturnType<typeof vi.fn>).mockResolvedValue(mockTasks);
  });

  it('returns tasks and loading state', async () => {
    const { result } = renderHook(() => useTasks(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.tasks).toEqual([]);
    await vi.waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.tasks).toHaveLength(mockTasks.length);
    mockTasks.forEach((mockTask) => {
      expect(result.current.tasks).toContainEqual(mockTask);
    });
  });

  it('calls createTask when creating a task', async () => {
    (taskApi.listTasks as ReturnType<typeof vi.fn>).mockResolvedValue(mockTasks);
    (taskApi.createTask as ReturnType<typeof vi.fn>).mockResolvedValue({ id: '3', name: 'New Task' });

    const { result } = renderHook(() => useTasks(), {
      wrapper: createWrapper(),
    });

    await vi.waitFor(() => expect(result.current.isLoading).toBe(false));

    const newTask = {
      name: 'New Task',
      description: 'New Description',
      dueAt: '2025-05-01T00:00:00.000Z',
    };

    await act(async () => {
      result.current.createTask(newTask);
      await vi.waitFor(() => expect(taskApi.createTask).toHaveBeenCalled());
    });

    expect(taskApi.createTask).toHaveBeenCalledWith(newTask);
  });
});

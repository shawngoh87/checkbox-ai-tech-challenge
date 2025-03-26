import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { listTasks, createTask, updateTask, calculateTaskStatus } from '../../api/tasks';
import { TaskStatus } from '../../types/task';

const originalFetch = global.fetch;

describe('TaskAPI', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('listTasks', () => {
    it('fetches tasks from the API and calculates status', async () => {
      const createdAt = new Date();
      const dueAt = new Date(createdAt.getTime() + 86400000 * 10);
      const mockListTasksResponse = {
        tasks: [
          {
            id: '1',
            name: 'Task 1',
            description: 'Description 1',
            dueAt: dueAt.toISOString(),
            createdAt: createdAt.toISOString(),
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockListTasksResponse,
      });

      const result = await listTasks();

      expect(global.fetch).toHaveBeenCalledWith('/api/v1/tasks');
      expect(result).toHaveLength(1);
      expect(result).toEqual([
        {
          id: '1',
          name: 'Task 1',
          description: 'Description 1',
          dueAt: dueAt.toISOString(),
          createdAt: createdAt.toISOString(),
          status: TaskStatus.NOT_URGENT,
        },
      ]);
    });
  });

  describe('createTask', () => {
    it('creates a task via the API', async () => {
      const createdAt = new Date();
      const dueAt = new Date(createdAt.getTime() + 86400000 * 10);
      const newTask = {
        name: 'New Task',
        description: 'New Description',
        dueAt: dueAt.toISOString(),
      };

      const mockResponse = {
        id: '123',
        ...newTask,
        createdAt: createdAt.toISOString(),
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await createTask(newTask);

      expect(global.fetch).toHaveBeenCalledWith('/api/v1/tasks', expect.any(Object));
      expect(result.id).toBe('123');
      expect(result).toHaveProperty('status');
      expect(result).toEqual({
        id: '123',
        name: 'New Task',
        description: 'New Description',
        dueAt: dueAt.toISOString(),
        createdAt: createdAt.toISOString(),
        status: TaskStatus.NOT_URGENT,
      });
    });
  });

  describe('updateTask', () => {
    it('updates a task via the API', async () => {
      const createdAt = new Date();
      const dueAt = new Date(createdAt.getTime() + 86400000 * 10);
      const taskId = '123';
      const updateData = {
        name: 'Updated Task',
        description: 'Updated Description',
        dueAt: dueAt.toISOString(),
      };

      const mockResponse = {
        id: taskId,
        ...updateData,
        createdAt: createdAt.toISOString(),
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await updateTask(taskId, updateData);

      expect(global.fetch).toHaveBeenCalledWith(`/api/v1/tasks/${taskId}`, expect.any(Object));
      expect(result.name).toBe('Updated Task');
      expect(result).toEqual({
        id: taskId,
        name: 'Updated Task',
        description: 'Updated Description',
        dueAt: dueAt.toISOString(),
        createdAt: createdAt.toISOString(),
        status: TaskStatus.NOT_URGENT,
      });
    });
  });

  describe('calculateTaskStatus', () => {
    it('returns OVERDUE when due date is in the past', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const result = calculateTaskStatus(pastDate.toISOString());

      expect(result).toBe(TaskStatus.OVERDUE);
    });

    it('returns DUE_SOON when due date is within 7 days', () => {
      const soonDate = new Date();
      soonDate.setDate(soonDate.getDate() + 5);

      const result = calculateTaskStatus(soonDate.toISOString());

      expect(result).toBe(TaskStatus.DUE_SOON);
    });

    it('returns NOT_URGENT when due date is more than 7 days away', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);

      const result = calculateTaskStatus(futureDate.toISOString());

      expect(result).toBe(TaskStatus.NOT_URGENT);
    });
  });
});

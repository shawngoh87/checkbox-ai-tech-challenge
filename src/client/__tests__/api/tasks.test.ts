import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchTasks, createTask, updateTask, calculateTaskStatus } from '../../api/tasks';
import { TaskStatus } from '../../types/task';

const originalFetch = global.fetch;

describe('TaskAPI', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('fetchTasks', () => {
    it('fetches tasks from the API and calculates status', async () => {
      const createDate = new Date();
      const dueDate = new Date(createDate.getTime() + 86400000 * 10);
      const mockTasks = [
        {
          id: '1',
          name: 'Task 1',
          description: 'Description 1',
          dueDate: dueDate.toISOString(),
          createDate: createDate.toISOString(),
        },
      ];

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockTasks,
      });

      const result = await fetchTasks();

      expect(global.fetch).toHaveBeenCalledWith('/api/v1/tasks');
      expect(result).toHaveLength(1);
      expect(result).toEqual([
        {
          id: '1',
          name: 'Task 1',
          description: 'Description 1',
          dueDate: dueDate.toISOString(),
          createDate: createDate.toISOString(),
          status: TaskStatus.NOT_URGENT,
        },
      ]);
    });
  });

  describe('createTask', () => {
    it('creates a task via the API', async () => {
      const createDate = new Date();
      const dueDate = new Date(createDate.getTime() + 86400000 * 10);
      const newTask = {
        name: 'New Task',
        description: 'New Description',
        dueDate: dueDate.toISOString(),
      };

      const mockResponse = {
        id: '123',
        ...newTask,
        createDate: createDate.toISOString(),
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
        dueDate: dueDate.toISOString(),
        createDate: createDate.toISOString(),
        status: TaskStatus.NOT_URGENT,
      });
    });
  });

  describe('updateTask', () => {
    it('updates a task via the API', async () => {
      const createDate = new Date();
      const dueDate = new Date(createDate.getTime() + 86400000 * 10);
      const taskId = '123';
      const updateData = {
        name: 'Updated Task',
        description: 'Updated Description',
        dueDate: dueDate.toISOString(),
      };

      const mockResponse = {
        id: taskId,
        ...updateData,
        createDate: createDate.toISOString(),
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
        dueDate: dueDate.toISOString(),
        createDate: createDate.toISOString(),
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

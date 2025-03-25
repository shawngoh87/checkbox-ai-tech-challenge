import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaskController } from '../../controller/task.controller.js';
import { ListTasksUseCase } from '../../use-case/task/list-tasks.js';
import { Task } from '../../types/task.js';
import { Request, Response } from 'express';

describe('TaskController', () => {
  let taskController: TaskController;
  let mockListTasksUseCase: { execute: ReturnType<typeof vi.fn> };
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockListTasksUseCase = {
      execute: vi.fn(),
    };
    taskController = new TaskController(mockListTasksUseCase as unknown as ListTasksUseCase);
    mockRequest = {};
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as Partial<Response>;
  });

  describe('listTasks', () => {
    it('should return 200 and task list on success', async () => {
      const tasks: Task[] = [
        {
          id: '1',
          name: 'Test Task',
          description: 'Test Description',
          dueDate: '2023-12-31T00:00:00.000Z',
          createDate: '2023-01-01T00:00:00.000Z',
        },
        {
          id: '2',
          name: 'Test Task 2',
          description: 'Test Description 2',
          dueDate: '2023-12-31T00:00:00.000Z',
          createDate: '2023-01-01T00:00:00.000Z',
        },
      ];
      (mockListTasksUseCase.execute as ReturnType<typeof vi.fn>).mockResolvedValue(tasks);

      await taskController.listTasks(mockRequest as Request, mockResponse as Response);

      expect(mockListTasksUseCase.execute).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(tasks);
    });

    it('should return 500 when the use case throws an error', async () => {
      const error = new Error('Database error');
      (mockListTasksUseCase.execute as ReturnType<typeof vi.fn>).mockRejectedValue(error);

      await taskController.listTasks(mockRequest as Request, mockResponse as Response);
    });
  });
});

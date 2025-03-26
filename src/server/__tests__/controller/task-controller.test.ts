import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaskController } from '../../controller/task.controller.js';
import { ListTasksUseCase } from '../../use-case/task/list-tasks.js';
import { Request, Response } from 'express';
import { Task } from '../../domain/task/task.model.js';

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
      const task1Props = {
        id: '1',
        name: 'Test Task',
        description: 'Test Description',
        dueAt: new Date('2023-12-31T00:00:00.000Z'),
        createdAt: new Date('2023-01-01T00:00:00.000Z'),
      };
      const task2Props = {
        id: '2',
        name: 'Test Task 2',
        description: 'Test Description 2',
        dueAt: new Date('2023-12-31T00:00:00.000Z'),
        createdAt: new Date('2023-01-01T00:00:00.000Z'),
      };

      const tasks = [new Task(task1Props), new Task(task2Props)];
      (mockListTasksUseCase.execute as ReturnType<typeof vi.fn>).mockResolvedValue(tasks);

      await taskController.listTasks(mockRequest as Request, mockResponse as Response);

      expect(mockListTasksUseCase.execute).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        tasks: [task1Props, task2Props],
      });
    });

    it('should return 500 when the use case throws an error', async () => {
      const error = new Error('Some unknown error');
      (mockListTasksUseCase.execute as ReturnType<typeof vi.fn>).mockRejectedValue(error);

      await taskController.listTasks(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unknown error' });
    });
  });
});

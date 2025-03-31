import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { Task } from '../../../domain/task/task.model.js';
import { ListTasksController } from './list-tasks.controller.js';
import { ListTasksUseCase } from '../../use-case/task/list-tasks.js';

describe('ListTasksController', () => {
  let listTasksController: ListTasksController;
  let mockListTasksUseCase: { execute: ReturnType<typeof vi.fn> };
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  const task1Props = {
    id: '1',
    name: 'Test Task',
    description: 'Test Description',
    dueAt: new Date('2023-12-31T00:00:00.000Z'),
    createdAt: new Date('2023-01-01T00:00:00.000Z'),
    version: 0,
  };
  const task2Props = {
    id: '2',
    name: 'Test Task 2',
    description: 'Test Description 2',
    dueAt: new Date('2023-12-31T00:00:00.000Z'),
    createdAt: new Date('2023-01-01T00:00:00.000Z'),
    version: 0,
  };

  beforeEach(() => {
    mockListTasksUseCase = {
      execute: vi.fn().mockResolvedValue([new Task(task1Props), new Task(task2Props)]),
    };
    listTasksController = new ListTasksController(mockListTasksUseCase as unknown as ListTasksUseCase);
    mockListTasksUseCase.execute.mockResolvedValue([new Task(task1Props), new Task(task2Props)]);
    mockRequest = {};
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as Partial<Response>;
  });

  describe('execute', () => {
    it('should return 200 and task list on success', async () => {
      mockRequest.query = {
        sort: 'created_at:asc',
        limit: '10',
        cursor: '1',
      };
      await listTasksController.execute(mockRequest as Request, mockResponse as Response);

      expect(mockListTasksUseCase.execute).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        tasks: [
          {
            id: '1',
            name: 'Test Task',
            description: 'Test Description',
            dueAt: '2023-12-31T00:00:00.000Z',
            createdAt: '2023-01-01T00:00:00.000Z',
            version: 0,
          },
          {
            id: '2',
            name: 'Test Task 2',
            description: 'Test Description 2',
            dueAt: '2023-12-31T00:00:00.000Z',
            createdAt: '2023-01-01T00:00:00.000Z',
            version: 0,
          },
        ],
      });
    });

    it('should return 500 when the use case throws an error', async () => {
      const error = new Error('Some unknown error');
      (mockListTasksUseCase.execute as ReturnType<typeof vi.fn>).mockRejectedValue(error);

      await listTasksController.execute(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unknown error' });
    });

    describe('validation', () => {
      const expectFailedValidation = async (req: Request) => {
        await listTasksController.execute(req, mockResponse as Response);
        expect(mockResponse.status).toHaveBeenCalledWith(422);
      };

      const expectSuccessfulValidation = async (req: Request) => {
        await listTasksController.execute(req, mockResponse as Response);
        expect(mockResponse.status).toHaveBeenCalledWith(200);
      };

      let req: Request;

      beforeEach(() => {
        req = {
          query: {
            sort: 'created_at:asc',
            limit: '10',
            cursor: '1',
          },
        } as unknown as Request;
      });

      describe('sort', () => {
        it('should validate missing sort', async () => {
          delete req.query.sort;
          await expectSuccessfulValidation(req);
        });

        it('should invalidate invalid sort', async () => {
          req.query.sort = 'invalid';
          await expectFailedValidation(req);
        });
      });

      describe('limit', () => {
        it('should validate missing limit', async () => {
          delete req.query.limit;
          await expectSuccessfulValidation(req);
        });

        it('should invalidate non-number limit', async () => {
          req.query.limit = 'aa';
          await expectFailedValidation(req);
        });

        it('should invalidate non-integer limit', async () => {
          req.query.limit = '3.14';
          await expectFailedValidation(req);
        });

        it('should invalidate limit less than 1', async () => {
          req.query.limit = '0';
          await expectFailedValidation(req);
        });

        it('should invalidate limit greater than 100', async () => {
          req.query.limit = '101';
          await expectFailedValidation(req);
        });
      });

      describe('cursor', () => {
        it('should validate missing cursor', async () => {
          delete req.query.cursor;
          await expectSuccessfulValidation(req);
        });

        it('should invalidate non-string cursor', async () => {
          req.query.cursor = '123';
          await expectSuccessfulValidation(req);
        });
      });
    });
  });
});

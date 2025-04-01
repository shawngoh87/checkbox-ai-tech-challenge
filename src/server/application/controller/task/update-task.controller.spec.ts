import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { Task } from '../../../domain/task/task.model.js';
import { UpdateTaskController } from './update-task.controller.js';
import { UpdateTaskUseCase } from '../../use-case/task/update-task.js';
import { v4 as uuidv4 } from 'uuid';

describe('UpdateTaskController', () => {
  let updateTaskController: UpdateTaskController;
  let mockUpdateTaskUseCase: { execute: ReturnType<typeof vi.fn> };
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockUpdateTaskUseCase = {
      execute: vi.fn().mockResolvedValue(
        new Task({
          id: 'a'.repeat(36),
          name: 'Updated Name',
          description: 'Updated Description',
          dueAt: new Date('2025-12-31T00:00:00.000Z'),
          createdAt: new Date('2025-01-01T00:00:00.000Z'),
          version: 0,
        }),
      ),
    };
    updateTaskController = new UpdateTaskController(mockUpdateTaskUseCase as unknown as UpdateTaskUseCase);
    mockRequest = {
      body: {
        id: 'a'.repeat(36),
        name: 'Updated Name',
        description: 'Updated Description',
        dueAt: '2025-12-31T00:00:00.000Z',
        version: 0,
      },
    };
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as Partial<Response>;
  });

  describe('execute', () => {
    it('should return 200 and task on success', async () => {
      await updateTaskController.execute(mockRequest as Request, mockResponse as Response);

      expect(mockUpdateTaskUseCase.execute).toHaveBeenCalledWith({
        id: 'a'.repeat(36),
        name: 'Updated Name',
        description: 'Updated Description',
        dueAt: new Date('2025-12-31T00:00:00.000Z'),
        version: 0,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        task: {
          id: 'a'.repeat(36),
          name: 'Updated Name',
          description: 'Updated Description',
          dueAt: '2025-12-31T00:00:00.000Z',
          createdAt: '2025-01-01T00:00:00.000Z',
          version: 0,
        },
      });
    });

    it('should return 500 when the use case throws an error', async () => {
      const error = new Error('Some unknown error');
      (mockUpdateTaskUseCase.execute as ReturnType<typeof vi.fn>).mockRejectedValue(error);

      await updateTaskController.execute(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });

    describe('validation', () => {
      const expectFailedValidation = async (req: Request) => {
        await updateTaskController.execute(req, mockResponse as Response);
        expect(mockResponse.status).toHaveBeenCalledWith(422);
      };

      beforeEach(() => {
        mockRequest.body = {
          id: uuidv4(),
          name: 'Test Task',
          description: 'Test Description',
          dueAt: '2025-12-31T00:00:00.000Z',
          version: 0,
        };
      });

      describe('id', () => {
        it('should invalidate missing id', async () => {
          delete mockRequest.body.id;
          await expectFailedValidation(mockRequest as Request);
        });

        it('should invalidate non-string id', async () => {
          mockRequest.body.id = 123;
          await expectFailedValidation(mockRequest as Request);
        });
      });

      describe('name', () => {
        it('should invalidate missing name', async () => {
          delete mockRequest.body.name;
          await expectFailedValidation(mockRequest as Request);
        });

        it('should invalidate empty name', async () => {
          mockRequest.body.name = '';
          await expectFailedValidation(mockRequest as Request);
        });

        it('should invalidate name longer than 200 characters', async () => {
          mockRequest.body.name = 'a'.repeat(201);
          await expectFailedValidation(mockRequest as Request);
        });
      });

      describe('description', () => {
        it('should invalidate missing description', async () => {
          delete mockRequest.body.description;
          await expectFailedValidation(mockRequest as Request);
        });

        it('should invalidate empty description', async () => {
          mockRequest.body.description = '';
          await expectFailedValidation(mockRequest as Request);
        });

        it('should invalidate description longer than 5000 characters', async () => {
          mockRequest.body.description = 'a'.repeat(5001);
          await expectFailedValidation(mockRequest as Request);
        });
      });

      describe('dueAt', () => {
        it('should invalidate missing dueAt', async () => {
          delete mockRequest.body.dueAt;
          await expectFailedValidation(mockRequest as Request);
        });

        it('should invalidate invalid dueAt', async () => {
          mockRequest.body.dueAt = 'invalid-date';
          await expectFailedValidation(mockRequest as Request);
        });
      });

      describe('version', () => {
        it('should invalidate missing version', async () => {
          delete mockRequest.body.version;
          await expectFailedValidation(mockRequest as Request);
        });

        it('should invalidate non-integer version', async () => {
          mockRequest.body.version = 1.5;
          await expectFailedValidation(mockRequest as Request);
        });

        it('should invalidate negative version', async () => {
          mockRequest.body.version = -1;
          await expectFailedValidation(mockRequest as Request);
        });
      });
    });
  });
});

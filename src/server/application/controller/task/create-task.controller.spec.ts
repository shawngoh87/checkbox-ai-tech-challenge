import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { CreateTaskController } from './create-task.controller.js';
import { Task } from '../../../domain/task/task.model.js';
import { CreateTaskUseCase } from '../../use-case/task/create-task.js';

describe('CreateTaskController', () => {
  let createTaskController: CreateTaskController;
  let mockCreateTaskUseCase: { execute: ReturnType<typeof vi.fn> };
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockCreateTaskUseCase = {
      execute: vi.fn().mockResolvedValue(
        new Task({
          id: '1',
          name: 'Test Task',
          description: 'Test Description',
          dueAt: new Date('2025-12-31T00:00:00.000Z'),
          createdAt: new Date('2025-01-01T00:00:00.000Z'),
          version: 0,
        }),
      ),
    };
    createTaskController = new CreateTaskController(mockCreateTaskUseCase as unknown as CreateTaskUseCase);
    mockRequest = {};
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as Partial<Response>;
  });

  describe('execute', () => {
    it('should return 200 and task on success', async () => {
      mockRequest.body = {
        name: 'Test Task',
        description: 'Test Description',
        dueAt: '2025-12-31T00:00:00.000Z',
      };

      await createTaskController.execute(mockRequest as Request, mockResponse as Response);

      expect(mockCreateTaskUseCase.execute).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        task: {
          id: '1',
          name: 'Test Task',
          description: 'Test Description',
          dueAt: '2025-12-31T00:00:00.000Z',
          createdAt: '2025-01-01T00:00:00.000Z',
          version: 0,
        },
      });
    });

    describe('validation', () => {
      const expectFailedValidation = async (req: Request) => {
        await createTaskController.execute(req, mockResponse as Response);
        expect(mockResponse.status).toHaveBeenCalledWith(422);
      };

      beforeEach(() => {
        mockRequest.body = {
          name: 'Test Task',
          description: 'Test Description',
          dueAt: '2025-12-31T00:00:00.000Z',
        };
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
    });
  });
});

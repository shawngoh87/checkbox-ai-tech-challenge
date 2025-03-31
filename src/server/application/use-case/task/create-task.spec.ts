import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateTaskUseCase } from './create-task.js';
import { TaskRepository } from '../../../infra/repository/task/task.repository.js';
import { Task } from '../../../domain/task/task.model.js';

describe('CreateTaskUseCase', () => {
  let mockRepository: { create: ReturnType<typeof vi.fn> };
  let createTaskUseCase: CreateTaskUseCase;
  let task: Task;

  beforeEach(() => {
    task = new Task({
      id: '3',
      name: 'Task 3',
      description: 'Description 3',
      dueAt: new Date(),
      createdAt: new Date(),
      version: 0,
    });
    mockRepository = {
      create: vi.fn().mockResolvedValue(task),
    };
    createTaskUseCase = new CreateTaskUseCase(mockRepository as unknown as TaskRepository);
  });

  it('should return tasks from the repository', async () => {
    const result = (
      await createTaskUseCase.execute({
        name: 'Task 3',
        description: 'Description 3',
        dueAt: new Date(),
      })
    ).toPlainObject();

    expect(mockRepository.create).toHaveBeenCalled();

    const taskPlainObject = task.toPlainObject();
    expect(result.id).toBe(taskPlainObject.id);
    expect(result.name).toBe(taskPlainObject.name);
    expect(result.description).toBe(taskPlainObject.description);
    expect(result.dueAt).toBe(taskPlainObject.dueAt);
    expect(result.createdAt).toBe(taskPlainObject.createdAt);
  });

  it('should retry once if unique key constraint error is thrown', async () => {
    task = new Task({
      id: '4',
      name: 'Task 4',
      description: 'Description 4',
      dueAt: new Date(),
      createdAt: new Date(),
      version: 0,
    });
    mockRepository.create = vi
      .fn()
      .mockRejectedValueOnce(new TaskRepository.UniqueKeyConstraintError())
      .mockResolvedValue(task);

    createTaskUseCase = new CreateTaskUseCase(mockRepository as unknown as TaskRepository);

    await createTaskUseCase.execute({
      name: 'Task 4',
      description: 'Description 4',
      dueAt: new Date(),
    });

    expect(mockRepository.create).toHaveBeenCalledTimes(2);
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UpdateTaskUseCase } from './update-task.js';
import { TaskRepository } from '../../../infra/repository/task/task.repository.js';
import { Task } from '../../../domain/task/task.model.js';

describe('UpdateTaskUseCase', () => {
  let mockRepository: { updateById: ReturnType<typeof vi.fn> };
  let updateTaskUseCase: UpdateTaskUseCase;
  let mockTask: Task;

  beforeEach(() => {
    mockTask = new Task({
      id: '3',
      name: 'Task 3',
      description: 'Description 3',
      dueAt: new Date(),
      createdAt: new Date(),
      version: 1,
    });
    mockRepository = {
      updateById: vi.fn().mockResolvedValue(mockTask),
    };
    updateTaskUseCase = new UpdateTaskUseCase(mockRepository as unknown as TaskRepository);
  });

  it('should update and return task from the repository', async () => {
    const result = (
      await updateTaskUseCase.execute({
        id: '3',
        name: 'Updated Name',
        description: 'Updated Description',
        dueAt: new Date(),
        version: 1,
      })
    ).toPlainObject();

    expect(mockRepository.updateById).toHaveBeenCalled();

    const taskPlainObject = mockTask.toPlainObject();
    expect(result.id).toBe(taskPlainObject.id);
    expect(result.name).toBe(taskPlainObject.name);
    expect(result.description).toBe(taskPlainObject.description);
    expect(result.dueAt).toBe(taskPlainObject.dueAt);
    expect(result.createdAt).toBe(taskPlainObject.createdAt);
    expect(result.version).toBe(taskPlainObject.version);
  });

  it('should throw UnknownError when update fails', async () => {
    mockRepository.updateById = vi.fn().mockRejectedValue(new Error('Database error'));

    updateTaskUseCase = new UpdateTaskUseCase(mockRepository as unknown as TaskRepository);

    await expect(
      updateTaskUseCase.execute({
        id: '3',
        name: 'Task 3',
        description: 'Description 3',
        dueAt: new Date(),
        version: 1,
      }),
    ).rejects.toThrow(UpdateTaskUseCase.UnknownError);

    expect(mockRepository.updateById).toHaveBeenCalledTimes(1);
  });
});

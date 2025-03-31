import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ListTasksUseCase } from './list-tasks.js';
import { TaskRepository } from '../../../infra/repository/task/task.repository.js';

describe('ListTasksUseCase', () => {
  let mockRepository: { findAll: ReturnType<typeof vi.fn> };
  let listTasksUseCase: ListTasksUseCase;

  beforeEach(() => {
    mockRepository = {
      findAll: vi.fn().mockResolvedValue([
        {
          id: '1',
          name: 'Task 1',
          description: 'Description 1',
          dueAt: new Date(),
          createdAt: new Date(),
          version: 0,
        },
        {
          id: '2',
          name: 'Task 2',
          description: 'Description 2',
          dueAt: new Date(),
          createdAt: new Date(),
          version: 0,
        },
      ]),
    };
    listTasksUseCase = new ListTasksUseCase(mockRepository as unknown as TaskRepository);
  });

  it('should return tasks from the repository', async () => {
    const result = await listTasksUseCase.execute();

    expect(mockRepository.findAll).toHaveBeenCalled();
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('id');
    expect(result[0]).toHaveProperty('name');
    expect(result[0]).toHaveProperty('description');
    expect(result[0]).toHaveProperty('dueAt');
    expect(result[0]).toHaveProperty('createdAt');
  });
});

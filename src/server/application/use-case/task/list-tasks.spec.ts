import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ListTasksUseCase } from './list-tasks.js';
import { TaskRepository } from '../../../infra/repository/task/task.repository.js';
import { Task } from '../../../domain/task/task.model.js';

describe('ListTasksUseCase', () => {
  let mockRepository: { findAll: ReturnType<typeof vi.fn> };
  let listTasksUseCase: ListTasksUseCase;
  let mockTasks: Task[];

  beforeEach(() => {
    mockTasks = [
      new Task({
        id: '1',
        name: 'Task 1',
        description: 'Description 1',
        dueAt: new Date(),
        createdAt: new Date(),
        version: 0,
      }),
      new Task({
        id: '2',
        name: 'Task 2',
        description: 'Description 2',
        dueAt: new Date(),
        createdAt: new Date(),
        version: 0,
      }),
    ];
    mockRepository = {
      findAll: vi.fn().mockResolvedValue({ tasks: mockTasks, nextCursor: 'somecursorstring' }),
    };
    listTasksUseCase = new ListTasksUseCase(mockRepository as unknown as TaskRepository);
  });

  it('should return tasks from the repository', async () => {
    const result = await listTasksUseCase.execute({
      sort: 'created_at:asc',
      limit: 10,
      cursor: 'somecursorstring',
    });

    expect(mockRepository.findAll).toHaveBeenCalledWith({
      sort: 'created_at:asc',
      limit: 10,
      cursor: 'somecursorstring',
    });
    expect(result.tasks.length).toBe(mockTasks.length);
    expect(result.tasks[0].toPlainObject()).toEqual(mockTasks[0].toPlainObject());
    expect(result.tasks[1].toPlainObject()).toEqual(mockTasks[1].toPlainObject());
    expect(result.nextCursor).toBe('somecursorstring');
  });
});

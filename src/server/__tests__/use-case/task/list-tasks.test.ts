import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryTaskRepository } from '../../../repository/task/in-memory-task.repository.js';
import { ListTasksUseCase } from '../../../use-case/task/list-tasks.js';

describe('ListTasksUseCase', () => {
  let repository: InMemoryTaskRepository;
  let listTasksUseCase: ListTasksUseCase;

  beforeEach(() => {
    repository = new InMemoryTaskRepository();
    listTasksUseCase = new ListTasksUseCase(repository);
  });
  it('should return tasks from the repository', async () => {
    const result = await listTasksUseCase.execute();
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('id');
    expect(result[0]).toHaveProperty('name');
    expect(result[0]).toHaveProperty('description');
    expect(result[0]).toHaveProperty('dueDate');
    expect(result[0]).toHaveProperty('createDate');
  });
});

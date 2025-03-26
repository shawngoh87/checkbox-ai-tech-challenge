import { describe, expect, it } from 'vitest';
import { Task } from '../../domain/task/task.model.js';

describe('Task Model', () => {
  it('should create a task', () => {
    const props = {
      id: 1,
      name: 'Test Task',
      description: 'Test Description',
      dueAt: new Date(),
      createdAt: new Date(),
    };
    const task = new Task(props);
    expect(task.toPlainObject()).toEqual(props);
  });
});

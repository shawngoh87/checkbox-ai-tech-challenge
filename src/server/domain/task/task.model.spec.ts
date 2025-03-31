import { describe, expect, it } from 'vitest';
import { Task } from './task.model.js';

describe('Task Model', () => {
  it('should create a task', () => {
    const props = {
      id: '1',
      name: 'Test Task',
      description: 'Test Description',
      dueAt: new Date(),
      createdAt: new Date(),
      version: 1,
    };

    const task = new Task(props);
    expect(task.toPlainObject()).toEqual(props);
  });
});

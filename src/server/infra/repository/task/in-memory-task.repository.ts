import { Task } from '../../../domain/task/task.model.js';
import { TaskFromDB } from '../../database/types.js';
import { TaskRepository } from './task.repository.interface.js';

export class InMemoryTaskRepository implements TaskRepository {
  private tasks: TaskFromDB[] = [
    {
      id: '1',
      name: 'Complete project',
      description: 'Finish the coding task',
      due_at: new Date(),
      created_at: new Date(),
    },
    {
      id: '2',
      name: 'Review documentation',
      description: 'Go through the technical documentation',
      due_at: new Date(),
      created_at: new Date(),
    },
    {
      id: '3',
      name: 'Submit report',
      description: 'Send the status report',
      due_at: new Date(),
      created_at: new Date(),
    },
  ];

  mapToDomain(task: TaskFromDB): Task {
    return new Task({
      id: task.id,
      name: task.name,
      description: task.description,
      dueAt: task.due_at,
      createdAt: task.created_at,
    });
  }

  findAll(): Promise<Task[]> {
    return Promise.resolve(this.tasks.map(this.mapToDomain));
  }
}

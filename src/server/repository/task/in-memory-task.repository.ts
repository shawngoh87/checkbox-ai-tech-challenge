import { Task } from '../../types/task.js';
import { TaskRepository } from './task.repository.interface.js';

export class InMemoryTaskRepository implements TaskRepository {
  private tasks: Task[] = [
    {
      id: '1',
      name: 'Complete project',
      description: 'Finish the coding task',
      dueDate: new Date().toISOString(),
      createDate: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Review documentation',
      description: 'Go through the technical documentation',
      dueDate: new Date().toISOString(),
      createDate: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Submit report',
      description: 'Send the status report',
      dueDate: new Date().toISOString(),
      createDate: new Date().toISOString(),
    },
  ];

  findAll(): Promise<Task[]> {
    return Promise.resolve([...this.tasks]);
  }
}

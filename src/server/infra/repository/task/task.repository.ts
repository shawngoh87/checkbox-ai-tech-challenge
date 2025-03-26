import { Database, TaskFromDB } from '../../database/types.js';
import { Kysely } from 'kysely';
import { TaskRepository as TaskRepositoryInterface } from './task.repository.interface.js';
import { Task } from '../../../domain/task/task.model.js';

export class TaskRepository implements TaskRepositoryInterface {
  constructor(private readonly db: Kysely<Database>) {}

  mapToDomain(task: TaskFromDB): Task {
    return new Task({
      id: task.id,
      name: task.name,
      description: task.description,
      dueAt: task.due_at,
      createdAt: task.created_at,
    });
  }

  async findAll(): Promise<Task[]> {
    const tasks = await this.db.selectFrom('task').selectAll().execute();
    return tasks.map(this.mapToDomain);
  }
}

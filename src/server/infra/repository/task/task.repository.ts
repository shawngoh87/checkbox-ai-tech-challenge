import { Database, TaskFromDB } from '../../database/types.js';
import { Kysely } from 'kysely';
import { Task } from '../../../domain/task/task.model.js';
import logger from '../../../utils/logger.js';

class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
  }
}

class UniqueKeyConstraintError extends DatabaseError {
  constructor() {
    super('Unique key constraint error');
  }
}

export class TaskRepository {
  constructor(private readonly db: Kysely<Database>) {}

  static DatabaseError = DatabaseError;
  static UniqueKeyConstraintError = UniqueKeyConstraintError;

  mapToDomain(task: TaskFromDB): Task {
    return new Task({
      id: task.id,
      name: task.name,
      description: task.description,
      dueAt: task.due_at,
      createdAt: task.created_at,
      version: task.version,
    });
  }

  async findAll(): Promise<Task[]> {
    const tasks = await this.db.selectFrom('task').selectAll().execute();
    return tasks.map(this.mapToDomain);
  }

  async create(params: { task: Task }): Promise<Task> {
    const task = params.task.toPlainObject();
    try {
      await this.db
        .insertInto('task')
        .values({
          id: task.id,
          name: task.name,
          description: task.description,
          due_at: task.dueAt,
          created_at: task.createdAt,
          version: 0,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      return params.task;
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === '23505') {
        throw new TaskRepository.UniqueKeyConstraintError();
      }

      logger.error(error);
      throw new TaskRepository.DatabaseError('Failed to create task');
    }
  }
}

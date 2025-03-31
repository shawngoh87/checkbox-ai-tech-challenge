import { Kysely } from 'kysely';
import { Database } from '../../database/types.js';
import { Task } from '../../../domain/task/task.model.js';
import { inject, injectable } from 'inversify';
import { getDatabaseServiceIdentifier } from '../../../constants.js';

export type TaskRepositoryFindAllOptions = {
  sortBy?: 'created_at' | 'due_at';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  cursor?: {
    created_at?: Date;
    due_at?: Date;
    id: string;
  };
};

class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
  }
}

class UniqueKeyConstraintError extends DatabaseError {
  constructor() {
    super('Task with the same id already exists');
  }
}

@injectable()
export class TaskRepository {
  static DatabaseError = DatabaseError;
  static UniqueKeyConstraintError = UniqueKeyConstraintError;

  constructor(@inject(getDatabaseServiceIdentifier()) private readonly db: Kysely<Database>) {}

  async findAll(options?: TaskRepositoryFindAllOptions): Promise<Task[]> {
    const sortBy = options?.sortBy ?? 'created_at';
    const sortOrder = options?.sortOrder ?? 'desc';
    const limit = options?.limit ?? 10;

    let query = this.db.selectFrom('task');

    if (options?.cursor) {
      const { cursor } = options;

      if (sortBy === 'created_at' && cursor.created_at) {
        const createdAt = cursor.created_at;
        query = query
          .where('created_at', sortOrder === 'desc' ? '<=' : '>=', createdAt)
          .where((eb) =>
            eb.or([
              eb('created_at', sortOrder === 'desc' ? '<' : '>', createdAt),
              eb.and([eb('created_at', '=', createdAt), eb('id', sortOrder === 'desc' ? '<' : '>', cursor.id)]),
            ]),
          );
      } else if (sortBy === 'due_at' && cursor.due_at) {
        const dueAt = cursor.due_at;
        query = query
          .where('due_at', sortOrder === 'desc' ? '<=' : '>=', dueAt)
          .where((eb) =>
            eb.or([
              eb('due_at', sortOrder === 'desc' ? '<' : '>', dueAt),
              eb.and([eb('due_at', '=', dueAt), eb('id', sortOrder === 'desc' ? '<' : '>', cursor.id)]),
            ]),
          );
      }
    }

    const tasks = await query.orderBy(sortBy, sortOrder).orderBy('id', sortOrder).limit(limit).selectAll().execute();

    return tasks.map(
      (task) =>
        new Task({
          id: task.id,
          name: task.name,
          description: task.description,
          dueAt: task.due_at,
          createdAt: task.created_at,
          version: task.version,
        }),
    );
  }

  async create({ task }: { task: Task }): Promise<Task> {
    try {
      const [createdTask] = await this.db
        .insertInto('task')
        .values({
          id: task.id,
          name: task.name,
          description: task.description,
          due_at: task.dueAt,
          created_at: task.createdAt,
          version: task.version,
        })
        .returningAll()
        .execute();

      return new Task({
        id: createdTask.id,
        name: createdTask.name,
        description: createdTask.description,
        dueAt: createdTask.due_at,
        createdAt: createdTask.created_at,
        version: createdTask.version,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('duplicate key value violates unique constraint')) {
        throw new TaskRepository.UniqueKeyConstraintError();
      }
      throw error;
    }
  }

  async updateById({ id, task }: { id: string; task: Task }): Promise<Task> {
    const [updatedTask] = await this.db
      .updateTable('task')
      .set({
        name: task.name,
        description: task.description,
        due_at: task.dueAt,
        version: task.version + 1,
      })
      .where('id', '=', id)
      .returningAll()
      .execute();

    return new Task({
      id: updatedTask.id,
      name: updatedTask.name,
      description: updatedTask.description,
      dueAt: updatedTask.due_at,
      createdAt: updatedTask.created_at,
      version: updatedTask.version,
    });
  }
}

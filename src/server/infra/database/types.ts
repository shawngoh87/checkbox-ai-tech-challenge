import { ColumnType, Generated, Insertable, Selectable, Updateable } from 'kysely';

export interface Database {
  task: TaskTable;
}

export interface TaskTable {
  id: Generated<string>; // uuidv4
  name: string;
  description: string;
  due_at: ColumnType<Date, Date | undefined, Date | undefined>;
  created_at: ColumnType<Date, Date | undefined, never>;
  version: number;
}

export type TaskFromDB = Selectable<TaskTable>;
export type NewTask = Insertable<TaskTable>;
export type TaskUpdate = Updateable<TaskTable>;

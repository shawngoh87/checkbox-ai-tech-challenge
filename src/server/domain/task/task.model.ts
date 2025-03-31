import { v4 as uuidv4 } from 'uuid';

export type TaskProps = {
  id: string;
  name: string;
  description: string;
  dueAt: Date;
  createdAt: Date;
  version: number;
};

export class Task {
  id: string;
  name: string;
  description: string;
  dueAt: Date;
  createdAt: Date;
  version: number;

  constructor(props: TaskProps) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.dueAt = props.dueAt;
    this.createdAt = props.createdAt;
    this.version = props.version;
  }

  static createNew(props: { name: string; description: string; dueAt: Date }): Task {
    return new Task({
      id: uuidv4(),
      name: props.name,
      description: props.description,
      dueAt: props.dueAt,
      createdAt: new Date(),
      version: 0,
    });
  }

  toPlainObject(): TaskProps {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      dueAt: this.dueAt,
      createdAt: this.createdAt,
      version: this.version,
    };
  }
}

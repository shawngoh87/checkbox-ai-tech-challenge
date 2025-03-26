export type TaskProps = {
  id: string;
  name: string;
  description: string;
  dueAt: Date;
  createdAt: Date;
};

export class Task {
  private id: string;
  private name: string;
  private description: string;
  private dueAt: Date;
  private createdAt: Date;

  constructor(props: TaskProps) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.dueAt = props.dueAt;
    this.createdAt = props.createdAt;
  }

  toPlainObject(): TaskProps {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      dueAt: this.dueAt,
      createdAt: this.createdAt,
    };
  }
}

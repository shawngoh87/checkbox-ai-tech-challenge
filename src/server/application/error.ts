import { ZodError } from 'zod';

export class ValidationError extends Error {
  issues: { path: (string | number)[]; message: string }[];

  constructor(error: ZodError) {
    const message = error.errors.map((e) => e.message).join(', ');
    super(message);
    this.name = 'ValidationError';
    this.issues = error.errors.map((e) => ({
      path: e.path,
      message: e.message,
    }));
  }
}

export class UnknownError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnknownError';
  }
}

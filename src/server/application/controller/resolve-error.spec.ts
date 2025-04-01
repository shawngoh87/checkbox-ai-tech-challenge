import { describe, expect, it } from 'vitest';
import { resolveError } from './resolve-error.js';
import { ValidationError } from '../error.js';
import { ZodError } from 'zod';

describe('resolveError', () => {
  it('should return 500 when the error is unknown', () => {
    const error = new Error('Some unknown error');
    const { status, json } = resolveError(error);

    expect(status).toBe(500);
    expect(json).toEqual({ error: 'Internal server error' });
  });

  it('should return 422 when the error is a validation error', () => {
    const error = new ValidationError({
      errors: [
        {
          path: ['name'],
          message: 'Name is required',
        },
      ],
    } as unknown as ZodError);
    const { status, json } = resolveError(error);

    expect(status).toBe(422);
    expect(json).toEqual({ error: error.issues });
  });
});

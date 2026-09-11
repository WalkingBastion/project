import { describe, expect, it } from 'vitest';
import { AxiosError } from 'axios';
import { extractErrorMessage } from '@/api/errors';

describe('extractErrorMessage', () => {
  it('extracts a plain string detail from an axios error', () => {
    const error = new AxiosError('Request failed');
    error.response = {
      data: { detail: 'Could not validate credentials' },
      status: 401,
      statusText: 'Unauthorized',
      headers: {},
      config: {} as never,
    };
    expect(extractErrorMessage(error)).toBe('Could not validate credentials');
  });

  it('joins structured validation errors into one message', () => {
    const error = new AxiosError('Request failed');
    error.response = {
      data: { detail: 'Validation error', errors: [{ field: 'password', message: 'too short' }] },
      status: 422,
      statusText: 'Unprocessable Entity',
      headers: {},
      config: {} as never,
    };
    expect(extractErrorMessage(error)).toBe('password: too short');
  });

  it('falls back to a generic message for unknown errors', () => {
    expect(extractErrorMessage('a plain string', 'Fallback message')).toBe('Fallback message');
  });

  it('uses Error.message for plain JS errors', () => {
    expect(extractErrorMessage(new Error('boom'))).toBe('boom');
  });
});

/**
 * Normalizes axios/FastAPI error shapes into a single human-readable
 * message, so components never need to know about response.data.detail
 * vs response.data.errors[].
 */
import { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types';

export function extractErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    if (data?.errors?.length) {
      return data.errors.map((e) => `${e.field}: ${e.message}`).join(', ');
    }
    if (typeof data?.detail === 'string') {
      return data.detail;
    }
    if (Array.isArray(data?.detail)) {
      return data.detail.map((e) => `${e.field}: ${e.message}`).join(', ');
    }
    if (error.message) {
      return error.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

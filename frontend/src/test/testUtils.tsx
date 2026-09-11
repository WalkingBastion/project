import type { ReactElement, ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError, type AxiosHeaders } from 'axios';
import { AuthProvider } from '@/context/AuthContext';
import type { ApiErrorResponse } from '@/types';

/**
 * Renders a component wrapped with the same providers App.tsx uses
 * (router, query client, auth context), so page-level tests exercise
 * real routing/context behavior instead of re-implementing mocks per
 * test file.
 */
export function renderWithProviders(
  ui: ReactElement,
  { route = '/', ...options }: { route?: string } & Omit<RenderOptions, 'wrapper'> = {},
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>
          <AuthProvider>{children}</AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

/**
 * Builds a real AxiosError instance (not a plain object) so code under
 * test that does `error instanceof AxiosError` - as api/errors.ts does -
 * behaves exactly as it would against a genuine failed axios request.
 */
export function mockAxiosError(data: ApiErrorResponse, status = 400): AxiosError {
  const error = new AxiosError('Request failed', String(status));
  error.response = {
    data,
    status,
    statusText: 'Error',
    headers: {},
    config: { headers: {} as AxiosHeaders },
  };
  return error;
}

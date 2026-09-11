import { describe, expect, it, vi, beforeEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import * as authApi from '@/api/auth';
import { tokenStorage } from '@/utils/tokenStorage';
import type { ReactNode } from 'react';

vi.mock('@/api/auth');

const mockUser = {
  id: 'u1',
  first_name: 'Ada',
  last_name: 'Lovelace',
  login: 'ada_l',
  role: 'user' as const,
  created_at: '2026-01-01T00:00:00Z',
};

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe('AuthContext', () => {
  beforeEach(() => {
    tokenStorage.clear();
    vi.clearAllMocks();
  });

  it('starts unauthenticated when there is no stored token', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.status).toBe('unauthenticated'));
    expect(result.current.user).toBeNull();
  });

  it('logs in successfully and stores the user', async () => {
    vi.mocked(authApi.loginUser).mockResolvedValue({
      access_token: 'access-1',
      refresh_token: 'refresh-1',
      token_type: 'bearer',
    });
    vi.mocked(authApi.fetchCurrentUser).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.status).toBe('unauthenticated'));

    await act(async () => {
      await result.current.login({ login: 'ada_l', password: 'StrongPass1' });
    });

    expect(result.current.status).toBe('authenticated');
    expect(result.current.user?.login).toBe('ada_l');
    expect(tokenStorage.getAccessToken()).toBe('access-1');
  });

  it('surfaces an error and stays unauthenticated on bad credentials', async () => {
    vi.mocked(authApi.loginUser).mockRejectedValue(new Error('Invalid credentials'));

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.status).toBe('unauthenticated'));

    await act(async () => {
      await expect(
        result.current.login({ login: 'ada_l', password: 'wrong' }),
      ).rejects.toThrow();
    });

    expect(result.current.status).toBe('error');
    expect(result.current.user).toBeNull();
  });

  it('clears tokens and user state on logout', async () => {
    vi.mocked(authApi.loginUser).mockResolvedValue({
      access_token: 'access-1',
      refresh_token: 'refresh-1',
      token_type: 'bearer',
    });
    vi.mocked(authApi.fetchCurrentUser).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.status).toBe('unauthenticated'));

    await act(async () => {
      await result.current.login({ login: 'ada_l', password: 'StrongPass1' });
    });
    expect(result.current.status).toBe('authenticated');

    act(() => {
      result.current.logout();
    });

    expect(result.current.status).toBe('unauthenticated');
    expect(result.current.user).toBeNull();
    expect(tokenStorage.getAccessToken()).toBeNull();
  });

  it('exposes isManager based on the user role', async () => {
    vi.mocked(authApi.loginUser).mockResolvedValue({
      access_token: 'access-1',
      refresh_token: 'refresh-1',
      token_type: 'bearer',
    });
    vi.mocked(authApi.fetchCurrentUser).mockResolvedValue({ ...mockUser, role: 'manager' });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.status).toBe('unauthenticated'));

    await act(async () => {
      await result.current.login({ login: 'ada_l', password: 'StrongPass1' });
    });

    expect(result.current.isManager).toBe(true);
  });
});

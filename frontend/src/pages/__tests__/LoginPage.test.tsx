import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginPage } from '@/pages/LoginPage';
import { renderWithProviders, mockAxiosError } from '@/test/testUtils';
import * as authApi from '@/api/auth';

vi.mock('@/api/auth');

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('logs the user in with valid credentials', async () => {
    vi.mocked(authApi.loginUser).mockResolvedValue({
      access_token: 'access-1',
      refresh_token: 'refresh-1',
      token_type: 'bearer',
    });
    vi.mocked(authApi.fetchCurrentUser).mockResolvedValue({
      id: 'u1',
      first_name: 'Ada',
      last_name: 'Lovelace',
      login: 'ada_l',
      role: 'user',
      created_at: '2026-01-01T00:00:00Z',
    });

    const user = userEvent.setup();
    renderWithProviders(<LoginPage />, { route: '/login' });

    await user.type(screen.getByLabelText(/login/i), 'ada_l');
    await user.type(screen.getByLabelText(/password/i), 'StrongPass1');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => expect(authApi.loginUser).toHaveBeenCalledWith({
      login: 'ada_l',
      password: 'StrongPass1',
    }));
  });

  it('shows an error message when login fails', async () => {
    vi.mocked(authApi.loginUser).mockRejectedValue(
      mockAxiosError({ detail: 'Could not validate credentials' }, 401),
    );

    const user = userEvent.setup();
    renderWithProviders(<LoginPage />, { route: '/login' });

    await user.type(screen.getByLabelText(/login/i), 'ada_l');
    await user.type(screen.getByLabelText(/password/i), 'WrongPass1');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not validate credentials');
  });

  it('requires both fields before the browser allows submission', async () => {
    renderWithProviders(<LoginPage />, { route: '/login' });
    expect(screen.getByLabelText(/login/i)).toBeRequired();
    expect(screen.getByLabelText(/password/i)).toBeRequired();
  });
});

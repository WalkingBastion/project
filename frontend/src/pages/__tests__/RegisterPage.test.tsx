import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegisterPage } from '@/pages/RegisterPage';
import { renderWithProviders } from '@/test/testUtils';
import * as authApi from '@/api/auth';

vi.mock('@/api/auth');

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('blocks submission and shows field errors for an invalid form', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterPage />, { route: '/register' });

    await user.click(screen.getByRole('button', { name: /sign up/i }));

    expect(await screen.findByText(/first name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
    expect(authApi.registerUser).not.toHaveBeenCalled();
  });

  it('flags a weak password without calling the API', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterPage />, { route: '/register' });

    await user.type(screen.getByLabelText(/first name/i), 'Ada');
    await user.type(screen.getByLabelText(/last name/i), 'Lovelace');
    await user.type(screen.getByLabelText(/^login$/i), 'ada_l');
    await user.type(screen.getByLabelText(/^password$/i), 'weakpass');
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    expect(await screen.findByText(/must contain at least one digit/i)).toBeInTheDocument();
    expect(authApi.registerUser).not.toHaveBeenCalled();
  });

  it('registers successfully with valid input', async () => {
    vi.mocked(authApi.registerUser).mockResolvedValue({
      id: 'u1',
      first_name: 'Ada',
      last_name: 'Lovelace',
      login: 'ada_l',
      role: 'user',
      created_at: '2026-01-01T00:00:00Z',
    });
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
    renderWithProviders(<RegisterPage />, { route: '/register' });

    await user.type(screen.getByLabelText(/first name/i), 'Ada');
    await user.type(screen.getByLabelText(/last name/i), 'Lovelace');
    await user.type(screen.getByLabelText(/^login$/i), 'ada_l');
    await user.type(screen.getByLabelText(/^password$/i), 'StrongPass1');
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    await vi.waitFor(() =>
      expect(authApi.registerUser).toHaveBeenCalledWith({
        first_name: 'Ada',
        last_name: 'Lovelace',
        login: 'ada_l',
        password: 'StrongPass1',
      }),
    );
  });
});

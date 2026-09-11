import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';

vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);

const baseAuthValue = {
  user: null,
  status: 'idle' as const,
  error: null,
  isManager: false,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
};

function renderProtected(route: string, managerOnly = false) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/login" element={<div>Login page</div>} />
        <Route path="/" element={<div>Home page</div>} />
        <Route
          path="/protected"
          element={
            <ProtectedRoute managerOnly={managerOnly}>
              <div>Secret content</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    mockedUseAuth.mockReset();
  });

  it('shows a loading state while auth status is unresolved', () => {
    mockedUseAuth.mockReturnValue({ ...baseAuthValue, status: 'loading' });

    renderProtected('/protected');
    expect(screen.getByText(/checking your session/i)).toBeInTheDocument();
  });

  it('redirects an unauthenticated user to /login', () => {
    mockedUseAuth.mockReturnValue({ ...baseAuthValue, status: 'unauthenticated' });

    renderProtected('/protected');
    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  it('renders the protected content for an authenticated user', () => {
    mockedUseAuth.mockReturnValue({
      ...baseAuthValue,
      status: 'authenticated',
      user: {
        id: 'u1',
        first_name: 'Ada',
        last_name: 'Lovelace',
        login: 'ada_l',
        role: 'user',
        created_at: '2026-01-01T00:00:00Z',
      },
    });

    renderProtected('/protected');
    expect(screen.getByText('Secret content')).toBeInTheDocument();
  });

  it('redirects a non-manager away from a manager-only route', () => {
    mockedUseAuth.mockReturnValue({
      ...baseAuthValue,
      status: 'authenticated',
      isManager: false,
      user: {
        id: 'u1',
        first_name: 'Ada',
        last_name: 'Lovelace',
        login: 'ada_l',
        role: 'user',
        created_at: '2026-01-01T00:00:00Z',
      },
    });

    renderProtected('/protected', true);
    expect(screen.getByText('Home page')).toBeInTheDocument();
  });

  it('renders manager-only content for a manager', () => {
    mockedUseAuth.mockReturnValue({
      ...baseAuthValue,
      status: 'authenticated',
      isManager: true,
      user: {
        id: 'u2',
        first_name: 'Jane',
        last_name: 'Doe',
        login: 'jane_m',
        role: 'manager',
        created_at: '2026-01-01T00:00:00Z',
      },
    });

    renderProtected('/protected', true);
    expect(screen.getByText('Secret content')).toBeInTheDocument();
  });
});

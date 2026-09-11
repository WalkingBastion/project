import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
  managerOnly?: boolean;
}

/**
 * Route guard: redirects anonymous users to /login (preserving the
 * originally requested location so we can bounce back after auth), and
 * redirects non-managers away from manager-only pages.
 */
export function ProtectedRoute({ children, managerOnly = false }: ProtectedRouteProps) {
  const { status, isManager } = useAuth();
  const location = useLocation();

  if (status === 'idle' || status === 'loading') {
    return <LoadingSpinner label="Checking your session…" />;
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (managerOnly && !isManager) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

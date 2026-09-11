/**
 * Global authentication state, implemented with React Context + a
 * reducer. This is the app's single source of truth for "who is
 * logged in" - pages and components read it via the `useAuth` hook
 * instead of prop-drilling the user object through the tree.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import { fetchCurrentUser, loginUser, registerUser } from '@/api/auth';
import { extractErrorMessage } from '@/api/errors';
import { tokenStorage } from '@/utils/tokenStorage';
import type { LoginPayload, RegisterPayload, User } from '@/types';

interface AuthState {
  user: User | null;
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error';
  error: string | null;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; user: User }
  | { type: 'AUTH_FAILURE'; error: string }
  | { type: 'LOGOUT' };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, status: 'loading', error: null };
    case 'AUTH_SUCCESS':
      return { user: action.user, status: 'authenticated', error: null };
    case 'AUTH_FAILURE':
      return { user: null, status: 'error', error: action.error };
    case 'LOGOUT':
      return { user: null, status: 'unauthenticated', error: null };
    default:
      return state;
  }
}

interface AuthContextValue extends AuthState {
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  isManager: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    status: 'idle',
    error: null,
  });

  const bootstrap = useCallback(async () => {
    if (!tokenStorage.getAccessToken()) {
      dispatch({ type: 'LOGOUT' });
      return;
    }
    dispatch({ type: 'AUTH_START' });
    try {
      const user = await fetchCurrentUser();
      dispatch({ type: 'AUTH_SUCCESS', user });
    } catch {
      tokenStorage.clear();
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    // Fired by the axios interceptor when a refresh attempt fails.
    const handleForcedLogout = () => dispatch({ type: 'LOGOUT' });
    window.addEventListener('auth:logout', handleForcedLogout);
    return () => window.removeEventListener('auth:logout', handleForcedLogout);
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const tokens = await loginUser(payload);
      tokenStorage.setTokens(tokens.access_token, tokens.refresh_token);
      const user = await fetchCurrentUser();
      dispatch({ type: 'AUTH_SUCCESS', user });
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE', error: extractErrorMessage(error, 'Login failed') });
      throw error;
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    dispatch({ type: 'AUTH_START' });
    try {
      await registerUser(payload);
      await login({ login: payload.login, password: payload.password });
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE', error: extractErrorMessage(error, 'Registration failed') });
      throw error;
    }
  }, [login]);

  const logout = useCallback(() => {
    tokenStorage.clear();
    dispatch({ type: 'LOGOUT' });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      register,
      logout,
      isManager: state.user?.role === 'manager',
    }),
    [state, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

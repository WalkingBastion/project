/**
 * Auth-related API calls. Kept as plain async functions (not hooks) so
 * they can be reused from React Query hooks, the AuthContext, and tests
 * without any React dependency.
 */
import { api } from '@/api/client';
import type {
  AuthTokens,
  LoginPayload,
  PasswordChangePayload,
  RegisterPayload,
  User,
} from '@/types';

export async function registerUser(payload: RegisterPayload): Promise<User> {
  const { data } = await api.post<User>('/auth/register', payload);
  return data;
}

export async function loginUser(payload: LoginPayload): Promise<AuthTokens> {
  const { data } = await api.post<AuthTokens>('/auth/login', payload);
  return data;
}

export async function fetchCurrentUser(): Promise<User> {
  const { data } = await api.get<User>('/auth/me');
  return data;
}

export async function changePassword(payload: PasswordChangePayload): Promise<User> {
  const { data } = await api.put<User>('/auth/password', payload);
  return data;
}

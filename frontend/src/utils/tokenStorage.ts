/**
 * Thin wrapper around localStorage for auth tokens. Isolated in its own
 * module so the storage mechanism (localStorage today) can be swapped
 * later without touching every call site.
 */
const ACCESS_TOKEN_KEY = 'booking_access_token';
const REFRESH_TOKEN_KEY = 'booking_refresh_token';

export const tokenStorage = {
  getAccessToken: (): string | null => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY),
  setTokens: (accessToken: string, refreshToken: string): void => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  clear: (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

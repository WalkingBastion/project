/**
 * Small, dependency-free client-side validation helpers used by the
 * auth forms. Mirrors (but does not replace) the backend's Pydantic
 * validation - client-side checks are for fast feedback only.
 */
export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function validateLogin(login: string): string | null {
  if (login.trim().length < 3) return 'Login must be at least 3 characters.';
  return null;
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters.';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one digit.';
  if (!/[a-zA-Z]/.test(password)) return 'Password must contain at least one letter.';
  return null;
}

export function validateRequired(value: string, fieldLabel: string): string | null {
  if (!value.trim()) return `${fieldLabel} is required.`;
  return null;
}

export function validateRegisterForm(fields: {
  firstName: string;
  lastName: string;
  login: string;
  password: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  const firstNameError = validateRequired(fields.firstName, 'First name');
  if (firstNameError) errors.firstName = firstNameError;

  const lastNameError = validateRequired(fields.lastName, 'Last name');
  if (lastNameError) errors.lastName = lastNameError;

  const loginError = validateLogin(fields.login);
  if (loginError) errors.login = loginError;

  const passwordError = validatePassword(fields.password);
  if (passwordError) errors.password = passwordError;

  return { valid: Object.keys(errors).length === 0, errors };
}

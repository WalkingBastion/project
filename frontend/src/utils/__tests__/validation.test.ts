import { describe, expect, it } from 'vitest';
import { validateLogin, validatePassword, validateRegisterForm } from '@/utils/validation';

describe('validateLogin', () => {
  it('rejects logins shorter than 3 characters', () => {
    expect(validateLogin('ab')).toMatch(/at least 3/);
  });

  it('accepts a valid login', () => {
    expect(validateLogin('validlogin')).toBeNull();
  });
});

describe('validatePassword', () => {
  it('rejects passwords shorter than 8 characters', () => {
    expect(validatePassword('short1')).toMatch(/at least 8/);
  });

  it('rejects passwords without a digit', () => {
    expect(validatePassword('alllettersnodigits')).toMatch(/digit/);
  });

  it('rejects passwords without a letter', () => {
    expect(validatePassword('12345678')).toMatch(/letter/);
  });

  it('accepts a strong password', () => {
    expect(validatePassword('StrongPass1')).toBeNull();
  });
});

describe('validateRegisterForm', () => {
  it('flags every missing/invalid field at once', () => {
    const result = validateRegisterForm({
      firstName: '',
      lastName: '',
      login: 'ab',
      password: 'weak',
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveProperty('firstName');
    expect(result.errors).toHaveProperty('lastName');
    expect(result.errors).toHaveProperty('login');
    expect(result.errors).toHaveProperty('password');
  });

  it('passes for a fully valid form', () => {
    const result = validateRegisterForm({
      firstName: 'Ada',
      lastName: 'Lovelace',
      login: 'ada_l',
      password: 'StrongPass1',
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });
});

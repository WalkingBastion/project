import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { extractErrorMessage } from '@/api/errors';
import { ErrorMessage } from '@/components/ErrorMessage';
import { validateRegisterForm } from '@/utils/validation';

export function RegisterPage() {
  const { register, status } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loginValue, setLoginValue] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (status === 'authenticated') {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);

    const result = validateRegisterForm({ firstName, lastName, login: loginValue, password });
    setFieldErrors(result.errors);
    if (!result.valid) return;

    setIsSubmitting(true);
    try {
      await register({ first_name: firstName, last_name: lastName, login: loginValue, password });
      navigate('/', { replace: true });
    } catch (error) {
      setFormError(extractErrorMessage(error, 'Unable to register.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="auth-page">
      <h1>Create an account</h1>
      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <div className="form-field">
          <label htmlFor="firstName">First name</label>
          <input
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            autoComplete="given-name"
          />
          {fieldErrors.firstName && <span className="field-error">{fieldErrors.firstName}</span>}
        </div>
        <div className="form-field">
          <label htmlFor="lastName">Last name</label>
          <input
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            autoComplete="family-name"
          />
          {fieldErrors.lastName && <span className="field-error">{fieldErrors.lastName}</span>}
        </div>
        <div className="form-field">
          <label htmlFor="regLogin">Login</label>
          <input
            id="regLogin"
            value={loginValue}
            onChange={(e) => setLoginValue(e.target.value)}
            autoComplete="username"
          />
          {fieldErrors.login && <span className="field-error">{fieldErrors.login}</span>}
        </div>
        <div className="form-field">
          <label htmlFor="regPassword">Password</label>
          <input
            id="regPassword"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
          {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
          <span className="field-hint">At least 8 characters, with a letter and a digit.</span>
        </div>

        {formError && <ErrorMessage message={formError} />}

        <button type="submit" className="button" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account…' : 'Sign up'}
        </button>
      </form>
      <p className="auth-page__switch">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </section>
  );
}

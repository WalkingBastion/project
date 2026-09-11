import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { extractErrorMessage } from '@/api/errors';
import { ErrorMessage } from '@/components/ErrorMessage';

interface LocationState {
  from?: { pathname: string };
}

export function LoginPage() {
  const { login, status } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [loginValue, setLoginValue] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (status === 'authenticated') {
    const redirectTo = (location.state as LocationState | null)?.from?.pathname ?? '/';
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      await login({ login: loginValue, password });
      const redirectTo = (location.state as LocationState | null)?.from?.pathname ?? '/';
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setFormError(extractErrorMessage(error, 'Unable to log in. Check your credentials.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="auth-page">
      <h1>Log in</h1>
      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <div className="form-field">
          <label htmlFor="login">Login</label>
          <input
            id="login"
            name="login"
            type="text"
            value={loginValue}
            onChange={(e) => setLoginValue(e.target.value)}
            required
            autoComplete="username"
          />
        </div>
        <div className="form-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        {formError && <ErrorMessage message={formError} />}

        <button type="submit" className="button" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <p className="auth-page__switch">
        Don't have an account? <Link to="/register">Sign up</Link>
      </p>
    </section>
  );
}

import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section className="not-found">
      <h1>404</h1>
      <p>We couldn't find that page.</p>
      <Link to="/" className="button">
        Back home
      </Link>
    </section>
  );
}

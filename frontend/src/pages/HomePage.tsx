import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export function HomePage() {
  const { status, user } = useAuth();

  return (
    <section className="home-hero">
      <h1>Find your next stay</h1>
      <p>
        Search hotel rooms by location, date, and price, book with confirmation, and get
        personalized alternatives based on what you've viewed.
      </p>
      <div className="home-hero__actions">
        <Link to="/bookings" className="button">
          Browse bookings
        </Link>
        {status !== 'authenticated' && (
          <Link to="/register" className="button button--secondary">
            Create an account
          </Link>
        )}
      </div>

      {status === 'authenticated' && user && (
        <p className="home-hero__welcome">
          Welcome back, {user.first_name}! Check your{' '}
          <Link to="/reservations">reservations</Link> or see what's{' '}
          <Link to="/recommendations">recommended for you</Link>.
        </p>
      )}

      <div className="home-features">
        <div className="home-features__item">
          <h2>Search &amp; filter</h2>
          <p>Filter by location, date range, and price to find exactly what you need.</p>
        </div>
        <div className="home-features__item">
          <h2>Book with confirmation</h2>
          <p>Reserve a room and confirm it in a couple of clicks - track status at any time.</p>
        </div>
        <div className="home-features__item">
          <h2>Smart recommendations</h2>
          <p>Alternative options tailored to your recent viewing and booking patterns.</p>
        </div>
      </div>
    </section>
  );
}

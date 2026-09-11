import { NavLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export function Navbar() {
  const { user, status, isManager, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar__brand">
        <NavLink to="/">🏨 Booking System</NavLink>
      </div>
      <nav className="navbar__links">
        <NavLink to="/bookings">Search</NavLink>
        {status === 'authenticated' && <NavLink to="/reservations">My reservations</NavLink>}
        {status === 'authenticated' && <NavLink to="/recommendations">For you</NavLink>}
        {isManager && <NavLink to="/manager">Manager</NavLink>}
      </nav>
      <div className="navbar__auth">
        {status === 'authenticated' && user ? (
          <>
            <span className="navbar__user">
              {user.first_name} {user.last_name}
            </span>
            <button type="button" className="button button--secondary" onClick={logout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login">Log in</NavLink>
            <NavLink to="/register" className="button">
              Sign up
            </NavLink>
          </>
        )}
      </div>
    </header>
  );
}

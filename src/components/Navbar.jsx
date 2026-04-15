import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  // Helper: adds 'active' class to the current page link
  function isActive(path) {
    return (
      location.pathname === path || location.pathname.startsWith(path + '/')
    );
  }

  return (
    <nav className='navbar'>
      <div className='navbar-inner container'>
        {/* Brand logo */}
        <Link to='/dashboard' className='navbar-brand'>
          <span className='brand-icon'>📚</span>
          <span className='brand-text'>
            Student<span className='brand-accent'>GroupStudy</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <ul className='navbar-links hide-mobile'>
          {!isAdmin && (
            <>
              <li>
                <Link
                  to='/dashboard'
                  className={`nav-link ${isActive('/dashboard') ? 'nav-link--active' : ''}`}
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to='/groups'
                  className={`nav-link ${isActive('/groups') ? 'nav-link--active' : ''}`}
                >
                  Study Groups
                </Link>
              </li>
            </>
          )}
          {isAdmin && (
            <li>
              <Link
                to='/admin'
                className={`nav-link ${isActive('/admin') ? 'nav-link--active' : ''}`}
              >
                Admin Panel
              </Link>
            </li>
          )}
        </ul>

        {/* User info + logout */}
        <div className='navbar-user'>
          <div className='user-pill'>
            <div className='user-avatar'>
              {/* Display first letter of the user's name as avatar */}
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span className='user-name hide-mobile'>
              {user?.name?.split(' ')[0]}
            </span>
            {isAdmin && (
              <span
                className='badge badge-amber'
                style={{ fontSize: '0.65rem' }}
              >
                ADMIN
              </span>
            )}
          </div>
          <button className='btn btn-ghost btn-sm' onClick={handleLogout}>
            Sign out
          </button>

          {/* Mobile hamburger */}
          <button
            className='hamburger'
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label='Toggle menu'
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className='mobile-menu'>
          {!isAdmin && (
            <>
              <Link to='/dashboard' onClick={() => setMenuOpen(false)}>
                Dashboard
              </Link>
              <Link to='/groups' onClick={() => setMenuOpen(false)}>
                Study Groups
              </Link>
            </>
          )}
          {isAdmin && (
            <Link to='/admin' onClick={() => setMenuOpen(false)}>
              Admin Panel
            </Link>
          )}
          <button onClick={handleLogout}>Sign out</button>
        </div>
      )}
    </nav>
  );
}

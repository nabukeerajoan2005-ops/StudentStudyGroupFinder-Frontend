import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './Auth.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Generic change handler for all inputs
  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Login failed.');
        return;
      }

      // Store token + user in context and redirect
      login(data.user, data.token);
      navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch {
      setError('Could not connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='auth-page'>
      {/* Left decorative panel */}
      <div className='auth-hero'>
        <div className='auth-hero-content'>
          <div className='auth-logo'>📚</div>
          <h1 className='auth-hero-title'>
            Find your
            <br />
            <span className='text-accent'>study tribe</span>
          </h1>
          <p className='auth-hero-sub'>
            Connect with fellow UCU BBUC students, form study groups, schedule
            sessions and study your courses together.
          </p>
          <div className='auth-hero-stats'>
            <div className='hero-stat'>
              <strong>100+</strong>
              <span>Students</span>
            </div>
            <div className='hero-stat'>
              <strong>50+</strong>
              <span>Groups</span>
            </div>
            <div className='hero-stat'>
              <strong>200+</strong>
              <span>Sessions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className='auth-form-panel'>
        <div className='auth-form-card'>
          <div className='auth-form-header'>
            <h2>Welcome back</h2>
            <p>Sign in to your StudentGroupStudy account</p>
          </div>

          {error && <div className='alert alert-error'>{error}</div>}

          <form onSubmit={handleSubmit} className='auth-form'>
            <div className='form-group'>
              <label className='form-label'>Email address</label>
              <input
                className='form-input'
                type='email'
                name='email'
                placeholder='Daniel@ucu.ac.ug'
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className='form-group'>
              <label className='form-label'>Password</label>
              <input
                className='form-input'
                type='password'
                name='password'
                placeholder='Enter your password'
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type='submit'
              className='btn btn-primary btn-lg'
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>

          <div className='auth-form-footer'>
            <p>
              Don't have an account? <Link to='/register'>Create one free</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

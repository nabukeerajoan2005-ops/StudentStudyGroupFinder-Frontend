import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

const PROGRAMS = [
  'Bachelor of Science in Information Technology',
  'Bachelor of Science Computer Science',
  'Bachelor of Science Software Engineering',
  'Bachelor of Science Information Systems',
  'Bachelor of Engineering',
  'Bachelor of Business Administration',
  'Other',
];

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
    program: '',
    year_of_study: '1',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (form.password !== form.confirm) {
      return setError('Passwords do not match.');
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          program: form.program,
          year_of_study: parseInt(form.year_of_study),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Registration failed.');
        return;
      }

      setSuccess(true);
      // Redirect to login after a short delay
      setTimeout(() => navigate('/login'), 2000);
    } catch {
      setError('Could not connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='auth-page'>
      {/* Left decorative panel */}
      <div className='auth-hero auth-hero--register'>
        <div className='auth-hero-content'>
          <div className='auth-logo'>🎓</div>
          <h1 className='auth-hero-title'>
            Start learning
            <br />
            <span className='text-accent'>together</span>
          </h1>
          <p className='auth-hero-sub'>
            Join hundreds of UCU BBUC students who are already collaborating,
            sharing notes, and studying smarter.
          </p>
          <ul className='auth-features'>
            <li>✦ Create & join study groups</li>
            <li>✦ Schedule study sessions</li>
            <li>✦ Share announcements</li>
            <li>✦ Connect across programs</li>
          </ul>
        </div>
      </div>

      {/* Right form panel */}
      <div className='auth-form-panel'>
        <div className='auth-form-card'>
          <div className='auth-form-header'>
            <h2>Create account</h2>
            <p>Join StudentGroupStudy for free</p>
          </div>

          {error && <div className='alert alert-error'>{error}</div>}
          {success && (
            <div className='alert alert-success'>
              ✓ Account created! Redirecting to login…
            </div>
          )}

          <form onSubmit={handleSubmit} className='auth-form'>
            {/* Two-column row for name + email */}
            <div className='form-row-2'>
              <div className='form-group'>
                <label className='form-label'>Full name</label>
                <input
                  className='form-input'
                  type='text'
                  name='name'
                  placeholder='Muhereza Daniel'
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className='form-group'>
                <label className='form-label'>Email</label>
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
            </div>

            {/* Program + Year row */}
            <div className='form-row-2'>
              <div className='form-group'>
                <label className='form-label'>Program</label>
                <select
                  className='form-select'
                  name='program'
                  value={form.program}
                  onChange={handleChange}
                  required
                >
                  <option value=''>Select program…</option>
                  {PROGRAMS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div className='form-group'>
                <label className='form-label'>Year of Study</label>
                <select
                  className='form-select'
                  name='year_of_study'
                  value={form.year_of_study}
                  onChange={handleChange}
                >
                  {[1, 2, 3].map((y) => (
                    <option key={y} value={y}>
                      Year {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Password row */}
            <div className='form-row-2'>
              <div className='form-group'>
                <label className='form-label'>Password</label>
                <input
                  className='form-input'
                  type='password'
                  name='password'
                  placeholder='Min. 6 characters'
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className='form-group'>
                <label className='form-label'>Confirm password</label>
                <input
                  className='form-input'
                  type='password'
                  name='confirm'
                  placeholder='Repeat password'
                  value={form.confirm}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button
              type='submit'
              className='btn btn-primary btn-lg'
              style={{ width: '100%' }}
              disabled={loading || success}
            >
              {loading ? 'Creating account…' : 'Create account →'}
            </button>
          </form>

          <div className='auth-form-footer'>
            <p>
              Already have an account? <Link to='/login'>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

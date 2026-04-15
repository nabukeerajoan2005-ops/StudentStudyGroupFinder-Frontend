import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { authFetch } = useAuth();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [sRes, uRes, gRes] = await Promise.all([
        authFetch('/api/admin/stats'),
        authFetch('/api/admin/users'),
        authFetch('/api/admin/groups'),
      ]);
      const [sData, uData, gData] = await Promise.all([
        sRes.json(),
        uRes.json(),
        gRes.json(),
      ]);
      setStats(sData);
      setUsers(Array.isArray(uData) ? uData : []);
      setGroups(Array.isArray(gData) ? gData : []);
    } catch (err) {
      console.error('Admin load error:', err);
    } finally {
      setLoading(false);
    }
  }

  function flash(type, text) {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3500);
  }

  async function handleDeleteUser(userId, userName) {
    if (!confirm(`Permanently delete user "${userName}"?`)) return;
    try {
      const res = await authFetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      flash(res.ok ? 'success' : 'error', data.message);
      if (res.ok) loadAll();
    } catch {
      flash('error', 'Failed to delete user.');
    }
  }

  async function handleDeleteGroup(groupId, groupName) {
    if (!confirm(`Delete group "${groupName}" and all its data?`)) return;
    try {
      const res = await authFetch(`/api/groups/${groupId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      flash(res.ok ? 'success' : 'error', data.message);
      if (res.ok) loadAll();
    } catch {
      flash('error', 'Failed to delete group.');
    }
  }

  if (loading) return <div className='spinner' />;

  // Find max group count for bar chart scaling
  const maxCount = Math.max(
    ...(stats?.activeCourses?.map((c) => c.group_count) ?? [1]),
    1,
  );

  return (
    <div className='page-enter page-content'>
      <div className='container'>
        {/* ── Admin Header ──────────────────────────────────── */}
        <div className='admin-header'>
          <div>
            <div className='admin-header-label'>Admin Panel</div>
            <h1 className='admin-title'>Platform Overview</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              StudentGroupStudy UCU-BBUC
            </p>
          </div>
          <div className='admin-badge'>
            <span>🛡</span> Administrator
          </div>
        </div>

        {/* Flash message */}
        {message.text && (
          <div
            className={`alert alert-${message.type}`}
            style={{ marginBottom: '1rem' }}
          >
            {message.text}
          </div>
        )}

        {/* ── Top Stats Cards ───────────────────────────────── */}
        <div className='admin-stats-grid'>
          <div className='stat-card'>
            <div className='stat-icon'>👥</div>
            <div className='stat-number'>{stats?.totalStudents ?? 0}</div>
            <div className='stat-label'>Students</div>
          </div>
          <div className='stat-card'>
            <div className='stat-icon'>📚</div>
            <div className='stat-number'>{stats?.totalGroups ?? 0}</div>
            <div className='stat-label'>Study Groups</div>
          </div>
          <div className='stat-card'>
            <div className='stat-icon'>📅</div>
            <div className='stat-number'>{stats?.totalSessions ?? 0}</div>
            <div className='stat-label'>Sessions</div>
          </div>
          <div className='stat-card'>
            <div className='stat-icon'>💬</div>
            <div className='stat-number'>{stats?.totalPosts ?? 0}</div>
            <div className='stat-label'>Posts</div>
          </div>
        </div>

        {/* ── Section nav ───────────────────────────────────── */}
        <div className='admin-nav'>
          {[
            { id: 'overview', label: '📊 Active Courses' },
            { id: 'users', label: `👤 Users (${users.length})` },
            { id: 'groups', label: `📚 Groups (${groups.length})` },
          ].map((s) => (
            <button
              key={s.id}
              className={`admin-nav-btn ${activeSection === s.id ? 'admin-nav-btn--active' : ''}`}
              onClick={() => setActiveSection(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* ── Active Courses Section ────────────────────────── */}
        {activeSection === 'overview' && (
          <div className='admin-section'>
            <h2 className='section-title'>Most Active Courses</h2>
            <p
              className='section-subtitle'
              style={{ marginBottom: 'var(--space-6)' }}
            >
              Courses with the most study groups created
            </p>
            {!stats?.activeCourses?.length ? (
              <div className='empty-state'>
                <div className='empty-icon'>📊</div>
                <h3>No data yet</h3>
              </div>
            ) : (
              <div className='course-bars'>
                {stats.activeCourses.map((course, i) => (
                  <div key={i} className='course-bar-row'>
                    <div className='course-bar-info'>
                      <span className='course-bar-code'>
                        {course.course_code}
                      </span>
                      <span className='course-bar-name'>
                        {course.course_name}
                      </span>
                    </div>
                    <div className='course-bar-track'>
                      <div
                        className='course-bar-fill'
                        style={{
                          width: `${(course.group_count / maxCount) * 100}%`,
                        }}
                      />
                    </div>
                    <span className='course-bar-count'>
                      {course.group_count} group
                      {course.group_count !== 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Users Management Section ──────────────────────── */}
        {activeSection === 'users' && (
          <div className='admin-section'>
            <div
              className='section-header'
              style={{ marginBottom: 'var(--space-5)' }}
            >
              <div>
                <h2 className='section-title'>Registered Users</h2>
                <p className='section-subtitle'>Manage all student accounts</p>
              </div>
            </div>
            <div className='admin-table-wrapper'>
              <table className='admin-table'>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Program</th>
                    <th>Year</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id}>
                      <td className='td-num'>{i + 1}</td>
                      <td className='td-name'>
                        <div className='td-avatar'>{u.name.charAt(0)}</div>
                        {u.name}
                      </td>
                      <td className='td-muted'>{u.email}</td>
                      <td className='td-muted'>{u.program}</td>
                      <td>
                        <span className='badge badge-blue'>
                          Yr {u.year_of_study}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${u.role === 'admin' ? 'badge-amber' : 'badge-green'}`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className='td-muted'>
                        {new Date(u.created_at).toLocaleDateString('en-UG', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td>
                        {u.role !== 'admin' && (
                          <button
                            className='btn btn-danger btn-sm'
                            onClick={() => handleDeleteUser(u.id, u.name)}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Groups Management Section ─────────────────────── */}
        {activeSection === 'groups' && (
          <div className='admin-section'>
            <div
              className='section-header'
              style={{ marginBottom: 'var(--space-5)' }}
            >
              <div>
                <h2 className='section-title'>All Study Groups</h2>
                <p className='section-subtitle'>
                  Monitor and manage all groups on the platform
                </p>
              </div>
            </div>
            <div className='admin-table-wrapper'>
              <table className='admin-table'>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Group Name</th>
                    <th>Course</th>
                    <th>Leader</th>
                    <th>Members</th>
                    <th>Created</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map((g, i) => (
                    <tr key={g.id}>
                      <td className='td-num'>{i + 1}</td>
                      <td className='td-name'>{g.name}</td>
                      <td>
                        <div className='td-course'>
                          <span
                            className='font-mono'
                            style={{
                              fontSize: '0.72rem',
                              color: 'var(--accent)',
                            }}
                          >
                            {g.course_code}
                          </span>
                          <span
                            className='td-muted'
                            style={{ fontSize: '0.8rem' }}
                          >
                            {g.course_name}
                          </span>
                        </div>
                      </td>
                      <td className='td-muted'>{g.leader_name}</td>
                      <td>
                        <span className='badge badge-blue'>
                          👥 {g.member_count}
                        </span>
                      </td>
                      <td className='td-muted'>
                        {new Date(g.created_at).toLocaleDateString('en-UG', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td>
                        <button
                          className='btn btn-danger btn-sm'
                          onClick={() => handleDeleteGroup(g.id, g.name)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

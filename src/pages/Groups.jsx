import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import GroupCard from '../components/GroupCard.jsx';
import './Groups.css';

export default function Groups() {
  const { authFetch, user } = useAuth();

  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showModal, setShowModal] = useState(false);

  // Form state for creating a new group
  const [newGroup, setNewGroup] = useState({
    name: '',
    course_name: '',
    course_code: '',
    description: '',
    meeting_location: '',
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadGroups();
    loadMyGroups();
  }, []);

  async function loadGroups() {
    setLoading(true);
    try {
      const res = await authFetch('/api/groups');
      const data = await res.json();
      setGroups(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function loadMyGroups() {
    try {
      const res = await authFetch('/api/groups/my/groups');
      const data = await res.json();
      setMyGroups(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  }

  // Live search: filter client-side for instant feedback
  const filtered = groups.filter((g) => {
    const q = search.toLowerCase();
    return (
      g.name.toLowerCase().includes(q) ||
      g.course_name.toLowerCase().includes(q) ||
      g.course_code.toLowerCase().includes(q)
    );
  });

  const myGroupIds = new Set(myGroups.map((g) => g.id));

  async function handleJoin(groupId) {
    setJoining(groupId);
    setMessage({ type: '', text: '' });
    try {
      const res = await authFetch(`/api/groups/${groupId}/join`, {
        method: 'POST',
      });
      const data = await res.json();
      setMessage({ type: res.ok ? 'success' : 'error', text: data.message });
      if (res.ok) {
        loadGroups();
        loadMyGroups();
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to join group.' });
    } finally {
      setJoining(null);
    }
  }

  function handleNewGroupChange(e) {
    setNewGroup((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleCreateGroup(e) {
    e.preventDefault();
    setCreating(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await authFetch('/api/groups', {
        method: 'POST',
        body: JSON.stringify(newGroup),
      });
      const data = await res.json();
      setMessage({ type: res.ok ? 'success' : 'error', text: data.message });
      if (res.ok) {
        setShowModal(false);
        setNewGroup({
          name: '',
          course_name: '',
          course_code: '',
          description: '',
          meeting_location: '',
        });
        loadGroups();
        loadMyGroups();
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to create group.' });
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className='page-enter page-content'>
      <div className='container'>
        {/* ── Header ──────────────────────────────────────────── */}
        <div className='groups-header'>
          <div>
            <h1 className='section-title' style={{ fontSize: '1.8rem' }}>
              Study Groups
            </h1>
            <p className='section-subtitle'>
              Browse all groups or create one for your course
            </p>
          </div>
          <button
            className='btn btn-primary'
            onClick={() => setShowModal(true)}
          >
            + Create Group
          </button>
        </div>

        {/* ── Search bar ──────────────────────────────────────── */}
        <div className='search-bar'>
          <span className='search-icon'>🔍</span>
          <input
            className='search-input'
            type='text'
            placeholder='Search by group name, course name, or course code…'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className='search-clear' onClick={() => setSearch('')}>
              ✕
            </button>
          )}
        </div>

        {/* Alert message */}
        {message.text && (
          <div
            className={`alert alert-${message.type}`}
            style={{ marginBottom: '1rem' }}
          >
            {message.text}
          </div>
        )}

        {/* ── Groups grid ─────────────────────────────────────── */}
        {loading ? (
          <div className='spinner' />
        ) : filtered.length === 0 ? (
          <div className='empty-state'>
            <div className='empty-icon'>{search ? '🔍' : '📚'}</div>
            <h3>
              {search ? 'No groups matched your search' : 'No groups yet'}
            </h3>
            <p>
              {search
                ? 'Try a different keyword.'
                : 'Be the first to create a study group!'}
            </p>
          </div>
        ) : (
          <>
            <p className='results-count'>
              Showing <strong>{filtered.length}</strong> group
              {filtered.length !== 1 ? 's' : ''}
            </p>
            <div className='groups-grid'>
              {filtered.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  isMember={myGroupIds.has(group.id)}
                  onJoin={handleJoin}
                  joining={joining}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Create Group Modal ────────────────────────────────── */}
      {showModal && (
        <div className='modal-overlay' onClick={() => setShowModal(false)}>
          <div className='modal' onClick={(e) => e.stopPropagation()}>
            <div className='modal-header'>
              <h2>Create Study Group</h2>
              <button
                className='modal-close'
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            {message.type === 'error' && (
              <div className='alert alert-error'>{message.text}</div>
            )}

            <form onSubmit={handleCreateGroup} className='modal-form'>
              <div className='form-row-2'>
                <div className='form-group'>
                  <label className='form-label'>Group Name *</label>
                  <input
                    className='form-input'
                    name='name'
                    placeholder='e.g. JAVASCRIPT PROGRAMMING'
                    value={newGroup.name}
                    onChange={handleNewGroupChange}
                    required
                  />
                </div>
                <div className='form-group'>
                  <label className='form-label'>Course Code *</label>
                  <input
                    className='form-input'
                    name='course_code'
                    placeholder='e.g. JS202'
                    value={newGroup.course_code}
                    onChange={handleNewGroupChange}
                    required
                  />
                </div>
              </div>

              <div className='form-group'>
                <label className='form-label'>Course Name *</label>
                <input
                  className='form-input'
                  name='course_name'
                  placeholder='e.g. React and Express'
                  value={newGroup.course_name}
                  onChange={handleNewGroupChange}
                  required
                />
              </div>

              <div className='form-group'>
                <label className='form-label'>Study Focus / Description</label>
                <textarea
                  className='form-textarea'
                  name='description'
                  placeholder='What topics will this group focus on?'
                  value={newGroup.description}
                  onChange={handleNewGroupChange}
                />
              </div>

              <div className='form-group'>
                <label className='form-label'>Meeting Location</label>
                <input
                  className='form-input'
                  name='meeting_location'
                  placeholder='e.g. L7, or Zoom link'
                  value={newGroup.meeting_location}
                  onChange={handleNewGroupChange}
                />
              </div>

              <div className='modal-actions'>
                <button
                  type='button'
                  className='btn btn-ghost'
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='btn btn-primary'
                  disabled={creating}
                >
                  {creating ? 'Creating…' : 'Create Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

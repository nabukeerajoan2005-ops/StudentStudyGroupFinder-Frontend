import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import SessionCard from '../components/SessionCard.jsx';
import './GroupDetail.css';

export default function GroupDetail() {
  const { id } = useParams();
  const { user, authFetch } = useAuth();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [message, setMessage] = useState({ type: '', text: '' });

  // ── Session form state ──────────────────────────────────────
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    title: '',
    session_date: '',
    session_time: '',
    location: '',
    description: '',
  });
  const [savingSession, setSavingSession] = useState(false);

  // ── Post form state ─────────────────────────────────────────
  const [postContent, setPostContent] = useState('');
  const [postingMsg, setPostingMsg] = useState(false);

  // ── Edit group state ────────────────────────────────────────
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    loadAll();
  }, [id]);

  async function loadAll() {
    setLoading(true);
    try {
      const [gRes, sRes, pRes] = await Promise.all([
        authFetch(`/api/groups/${id}`),
        authFetch(`/api/sessions/group/${id}`),
        authFetch(`/api/posts/group/${id}`),
      ]);
      const [gData, sData, pData] = await Promise.all([
        gRes.json(),
        sRes.json(),
        pRes.json(),
      ]);
      if (!gRes.ok) {
        navigate('/groups');
        return;
      }
      setGroup(gData);
      setEditForm({
        name: gData.name,
        course_name: gData.course_name,
        course_code: gData.course_code,
        description: gData.description || '',
        meeting_location: gData.meeting_location || '',
      });
      setSessions(Array.isArray(sData) ? sData : []);
      setPosts(Array.isArray(pData) ? pData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // ── Helpers ─────────────────────────────────────────────────
  const isMember = group?.members?.some((m) => m.id === user.id);
  const isLeader = group?.leader_id === user.id;

  function flash(type, text) {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3500);
  }

  // ── Join / Leave ────────────────────────────────────────────
  async function handleJoin() {
    const res = await authFetch(`/api/groups/${id}/join`, { method: 'POST' });
    const data = await res.json();
    flash(res.ok ? 'success' : 'error', data.message);
    if (res.ok) loadAll();
  }

  async function handleLeave() {
    if (!confirm('Leave this group?')) return;
    const res = await authFetch(`/api/groups/${id}/leave`, {
      method: 'DELETE',
    });
    const data = await res.json();
    flash(res.ok ? 'success' : 'error', data.message);
    if (res.ok) loadAll();
  }

  // ── Remove member (leader only) ─────────────────────────────
  async function handleRemoveMember(memberId, memberName) {
    if (!confirm(`Remove ${memberName} from this group?`)) return;
    const res = await authFetch(`/api/groups/${id}/members/${memberId}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    flash(res.ok ? 'success' : 'error', data.message);
    if (res.ok) loadAll();
  }

  // ── Schedule session ────────────────────────────────────────
  async function handleCreateSession(e) {
    e.preventDefault();
    setSavingSession(true);
    try {
      const res = await authFetch('/api/sessions', {
        method: 'POST',
        body: JSON.stringify({ group_id: parseInt(id), ...sessionForm }),
      });
      const data = await res.json();
      flash(res.ok ? 'success' : 'error', data.message);
      if (res.ok) {
        setShowSessionForm(false);
        setSessionForm({
          title: '',
          session_date: '',
          session_time: '',
          location: '',
          description: '',
        });
        loadAll();
      }
    } finally {
      setSavingSession(false);
    }
  }

  async function handleDeleteSession(sessionId) {
    if (!confirm('Cancel this session?')) return;
    const res = await authFetch(`/api/sessions/${sessionId}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    flash(res.ok ? 'success' : 'error', data.message);
    if (res.ok) loadAll();
  }

  // ── Post message ────────────────────────────────────────────
  async function handlePost(e) {
    e.preventDefault();
    if (!postContent.trim()) return;
    setPostingMsg(true);
    try {
      const res = await authFetch('/api/posts', {
        method: 'POST',
        body: JSON.stringify({ group_id: parseInt(id), content: postContent }),
      });
      const data = await res.json();
      if (res.ok) {
        setPostContent('');
        loadAll();
      } else flash('error', data.message);
    } finally {
      setPostingMsg(false);
    }
  }

  async function handleDeletePost(postId) {
    const res = await authFetch(`/api/posts/${postId}`, { method: 'DELETE' });
    const data = await res.json();
    flash(res.ok ? 'success' : 'error', data.message);
    if (res.ok) loadAll();
  }

  // ── Edit group ──────────────────────────────────────────────
  async function handleEditGroup(e) {
    e.preventDefault();
    setSavingEdit(true);
    try {
      const res = await authFetch(`/api/groups/${id}`, {
        method: 'PUT',
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      flash(res.ok ? 'success' : 'error', data.message);
      if (res.ok) {
        setShowEditModal(false);
        loadAll();
      }
    } finally {
      setSavingEdit(false);
    }
  }

  // ── Delete group ─────────────────────────────────────────────
  async function handleDeleteGroup() {
    if (!confirm('Permanently delete this group and all its data?')) return;
    const res = await authFetch(`/api/groups/${id}`, { method: 'DELETE' });
    if (res.ok) navigate('/groups');
  }

  if (loading) return <div className='spinner' />;
  if (!group) return null;

  return (
    <div className='page-enter page-content'>
      <div className='container'>
        {/* ── Group Header ──────────────────────────────────── */}
        <div className='group-detail-header'>
          <div className='group-detail-meta'>
            <span className='gd-code'>{group.course_code}</span>
            <h1 className='gd-title'>{group.name}</h1>
            <p className='gd-course'>{group.course_name}</p>
            {group.meeting_location && (
              <p className='gd-location'>📍 {group.meeting_location}</p>
            )}
            <div className='gd-badges'>
              <span className='badge badge-green'>
                👥 {group.members?.length ?? 0} members
              </span>
              {isLeader && (
                <span className='badge badge-amber'>👑 You are the leader</span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className='group-detail-actions'>
            {!isMember && (
              <button className='btn btn-primary' onClick={handleJoin}>
                Join Group
              </button>
            )}
            {isMember && !isLeader && (
              <button className='btn btn-danger' onClick={handleLeave}>
                Leave Group
              </button>
            )}
            {isLeader && (
              <>
                <button
                  className='btn btn-secondary'
                  onClick={() => setShowEditModal(true)}
                >
                  ✏ Edit Group
                </button>
                <button
                  className='btn btn-danger btn-sm'
                  onClick={handleDeleteGroup}
                >
                  Delete
                </button>
              </>
            )}
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

        {/* ── Tabs ─────────────────────────────────────────── */}
        <div className='gd-tabs'>
          {['overview', 'sessions', 'posts'].map((tab) => (
            <button
              key={tab}
              className={`gd-tab ${activeTab === tab ? 'gd-tab--active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'overview' && '👥 '}
              {tab === 'sessions' && '📅 '}
              {tab === 'posts' && '💬 '}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'sessions' && (
                <span className='tab-count'>{sessions.length}</span>
              )}
              {tab === 'posts' && (
                <span className='tab-count'>{posts.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── Tab Content ──────────────────────────────────── */}
        <div className='gd-content'>
          {/* OVERVIEW TAB: description + member list */}
          {activeTab === 'overview' && (
            <div className='gd-overview'>
              {group.description && (
                <div
                  className='card'
                  style={{ marginBottom: 'var(--space-6)' }}
                >
                  <h3
                    style={{ marginBottom: 'var(--space-3)', fontWeight: 700 }}
                  >
                    About this group
                  </h3>
                  <p
                    style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}
                  >
                    {group.description}
                  </p>
                </div>
              )}

              <div className='members-section'>
                <h3 className='members-heading'>
                  Members{' '}
                  <span className='tab-count'>
                    {group.members?.length ?? 0}
                  </span>
                </h3>
                <div className='members-list'>
                  {group.members?.map((member) => (
                    <div key={member.id} className='member-row'>
                      <div className='member-avatar'>
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className='member-info'>
                        <span className='member-name'>
                          {member.name}
                          {member.id === group.leader_id && (
                            <span
                              className='badge badge-amber'
                              style={{
                                marginLeft: '0.5rem',
                                fontSize: '0.65rem',
                              }}
                            >
                              Leader
                            </span>
                          )}
                          {member.id === user.id && (
                            <span
                              className='badge badge-blue'
                              style={{
                                marginLeft: '0.5rem',
                                fontSize: '0.65rem',
                              }}
                            >
                              You
                            </span>
                          )}
                        </span>
                        <span className='member-meta'>
                          {member.program} · Year {member.year_of_study}
                        </span>
                      </div>
                      {/* Leader can remove any non-leader member */}
                      {isLeader && member.id !== group.leader_id && (
                        <button
                          className='btn btn-danger btn-sm'
                          onClick={() =>
                            handleRemoveMember(member.id, member.name)
                          }
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SESSIONS TAB */}
          {activeTab === 'sessions' && (
            <div>
              {/* Leader-only session creation form */}
              {isLeader && (
                <div style={{ marginBottom: 'var(--space-6)' }}>
                  {!showSessionForm ? (
                    <button
                      className='btn btn-primary'
                      onClick={() => setShowSessionForm(true)}
                    >
                      + Schedule a Session
                    </button>
                  ) : (
                    <div className='card'>
                      <h3
                        style={{
                          marginBottom: 'var(--space-5)',
                          fontWeight: 700,
                        }}
                      >
                        New Study Session
                      </h3>
                      <form
                        onSubmit={handleCreateSession}
                        className='session-form'
                      >
                        <div className='form-row-2'>
                          <div className='form-group'>
                            <label className='form-label'>Title *</label>
                            <input
                              className='form-input'
                              placeholder='e.g. Exam Revision'
                              value={sessionForm.title}
                              onChange={(e) =>
                                setSessionForm((p) => ({
                                  ...p,
                                  title: e.target.value,
                                }))
                              }
                              required
                            />
                          </div>
                          <div className='form-group'>
                            <label className='form-label'>
                              Location / Link
                            </label>
                            <input
                              className='form-input'
                              placeholder='Library Room 4 or Zoom link'
                              value={sessionForm.location}
                              onChange={(e) =>
                                setSessionForm((p) => ({
                                  ...p,
                                  location: e.target.value,
                                }))
                              }
                            />
                          </div>
                        </div>
                        <div className='form-row-2'>
                          <div className='form-group'>
                            <label className='form-label'>Date *</label>
                            <input
                              className='form-input'
                              type='date'
                              value={sessionForm.session_date}
                              onChange={(e) =>
                                setSessionForm((p) => ({
                                  ...p,
                                  session_date: e.target.value,
                                }))
                              }
                              required
                            />
                          </div>
                          <div className='form-group'>
                            <label className='form-label'>Time *</label>
                            <input
                              className='form-input'
                              type='time'
                              value={sessionForm.session_time}
                              onChange={(e) =>
                                setSessionForm((p) => ({
                                  ...p,
                                  session_time: e.target.value,
                                }))
                              }
                              required
                            />
                          </div>
                        </div>
                        <div className='form-group'>
                          <label className='form-label'>Description</label>
                          <textarea
                            className='form-textarea'
                            placeholder='What will you cover?'
                            value={sessionForm.description}
                            onChange={(e) =>
                              setSessionForm((p) => ({
                                ...p,
                                description: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className='form-actions-row'>
                          <button
                            type='button'
                            className='btn btn-ghost'
                            onClick={() => setShowSessionForm(false)}
                          >
                            Cancel
                          </button>
                          <button
                            type='submit'
                            className='btn btn-primary'
                            disabled={savingSession}
                          >
                            {savingSession ? 'Saving…' : 'Schedule Session'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              )}

              {sessions.length === 0 ? (
                <div className='empty-state'>
                  <div className='empty-icon'>📅</div>
                  <h3>No sessions scheduled yet</h3>
                  {isLeader && (
                    <p>Use the button above to schedule the first session.</p>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-3)',
                  }}
                >
                  {sessions.map((s) => (
                    <SessionCard
                      key={s.id}
                      session={s}
                      isLeader={isLeader}
                      onDelete={handleDeleteSession}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* POSTS TAB */}
          {activeTab === 'posts' && (
            <div>
              {/* Post composer (for members only) */}
              {isMember && (
                <div className='post-composer'>
                  <div className='composer-avatar'>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <form onSubmit={handlePost} className='composer-form'>
                    <textarea
                      className='form-textarea'
                      placeholder='Share an announcement, ask a question, or coordinate…'
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      rows={3}
                    />
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        marginTop: 'var(--space-2)',
                      }}
                    >
                      <button
                        type='submit'
                        className='btn btn-primary btn-sm'
                        disabled={postingMsg || !postContent.trim()}
                      >
                        {postingMsg ? 'Posting…' : 'Post'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {posts.length === 0 ? (
                <div className='empty-state'>
                  <div className='empty-icon'>💬</div>
                  <h3>No posts yet</h3>
                  <p>Be the first to start the conversation.</p>
                </div>
              ) : (
                <div className='posts-list'>
                  {posts.map((post) => (
                    <div key={post.id} className='post-card'>
                      <div className='post-author-avatar'>
                        {post.author_name.charAt(0).toUpperCase()}
                      </div>
                      <div className='post-body'>
                        <div className='post-header'>
                          <span className='post-author'>
                            {post.author_name}
                          </span>
                          <span className='post-date'>
                            {new Date(post.created_at).toLocaleDateString(
                              'en-UG',
                              {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              },
                            )}
                          </span>
                        </div>
                        <p className='post-content'>{post.content}</p>
                      </div>
                      {/* Delete allowed for: post author, group leader, or admin */}
                      {(post.user_id === user.id ||
                        isLeader ||
                        user.role === 'admin') && (
                        <button
                          className='post-delete-btn'
                          onClick={() => handleDeletePost(post.id)}
                          title='Delete post'
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Edit Group Modal ─────────────────────────────────── */}
      {showEditModal && (
        <div className='modal-overlay' onClick={() => setShowEditModal(false)}>
          <div className='modal' onClick={(e) => e.stopPropagation()}>
            <div className='modal-header'>
              <h2>Edit Group</h2>
              <button
                className='modal-close'
                onClick={() => setShowEditModal(false)}
              >
                ✕
              </button>
            </div>
            <form
              onSubmit={handleEditGroup}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)',
              }}
            >
              <div className='form-row-2'>
                <div className='form-group'>
                  <label className='form-label'>Group Name *</label>
                  <input
                    className='form-input'
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, name: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className='form-group'>
                  <label className='form-label'>Course Code *</label>
                  <input
                    className='form-input'
                    value={editForm.course_code}
                    onChange={(e) =>
                      setEditForm((p) => ({
                        ...p,
                        course_code: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>
              <div className='form-group'>
                <label className='form-label'>Course Name *</label>
                <input
                  className='form-input'
                  value={editForm.course_name}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, course_name: e.target.value }))
                  }
                  required
                />
              </div>
              <div className='form-group'>
                <label className='form-label'>Description</label>
                <textarea
                  className='form-textarea'
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, description: e.target.value }))
                  }
                />
              </div>
              <div className='form-group'>
                <label className='form-label'>Meeting Location</label>
                <input
                  className='form-input'
                  value={editForm.meeting_location}
                  onChange={(e) =>
                    setEditForm((p) => ({
                      ...p,
                      meeting_location: e.target.value,
                    }))
                  }
                />
              </div>
              <div className='modal-actions'>
                <button
                  type='button'
                  className='btn btn-ghost'
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='btn btn-primary'
                  disabled={savingEdit}
                >
                  {savingEdit ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

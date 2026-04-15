import { Link } from 'react-router-dom';
import './GroupCard.css';

export default function GroupCard({ group, isMember, onJoin, joining }) {
  return (
    <div className='group-card'>
      {/* Top color strip based on course code hash for visual variety */}
      <div
        className='group-card-stripe'
        style={{ background: getCourseColor(group.course_code) }}
      />

      <div className='group-card-body'>
        {/* Course badge */}
        <div className='group-course-badge'>
          <span className='font-mono'>{group.course_code}</span>
        </div>

        {/* Group name */}
        <h3 className='group-card-title'>{group.name}</h3>

        {/* Course full name */}
        <p className='group-course-name'>{group.course_name}</p>

        {/* Description (truncated) */}
        {group.description && (
          <p className='group-card-desc'>{group.description}</p>
        )}

        {/* Footer row: meta info + actions */}
        <div className='group-card-footer'>
          <div className='group-meta'>
            <span className='meta-item'>
              👥 <strong>{group.member_count ?? 0}</strong> members
            </span>
            <span className='meta-item'>👤 {group.leader_name}</span>
          </div>

          <div className='group-card-actions'>
            {/* Always allow viewing the group detail */}
            <Link
              to={`/groups/${group.id}`}
              className='btn btn-secondary btn-sm'
            >
              View
            </Link>
            {/* Join button shown only if the user hasn't joined yet */}
            {!isMember && onJoin && (
              <button
                className='btn btn-primary btn-sm'
                onClick={() => onJoin(group.id)}
                disabled={joining === group.id}
              >
                {joining === group.id ? 'Joining…' : 'Join'}
              </button>
            )}
            {isMember && <span className='badge badge-green'>Joined ✓</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

// Deterministic color picker based on the course code string
// so the same course always gets the same accent color
function getCourseColor(code = '') {
  const colors = [
    'linear-gradient(90deg, #00e5a0, #00b87c)',
    'linear-gradient(90deg, #ffb347, #e09b35)',
    'linear-gradient(90deg, #4da6ff, #2979cc)',
    'linear-gradient(90deg, #ff4d6d, #cc3d57)',
    'linear-gradient(90deg, #b47aff, #8a4fff)',
    'linear-gradient(90deg, #00d4ff, #0099cc)',
  ];
  let hash = 0;
  for (const ch of code) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffff;
  return colors[hash % colors.length];
}

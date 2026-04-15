import './SessionCard.css';

export default function SessionCard({ session, onDelete, isLeader }) {
  // Format the date nicely e.g. "Tuesday, April 15, 2026"
  const formattedDate = new Date(session.session_date).toLocaleDateString(
    'en-UG',
    {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC', // prevent off-by-one from timezone shifts
    },
  );

  // Format time to 12-hour e.g. "2:30 PM"
  const [hh, mm] = session.session_time.split(':');
  const hour = parseInt(hh);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const formattedTime = `${hour % 12 || 12}:${mm} ${ampm}`;

  // Check if the session is in the past
  const sessionDateTime = new Date(
    `${session.session_date}T${session.session_time}`,
  );
  const isPast = sessionDateTime < new Date();

  return (
    <div className={`session-card ${isPast ? 'session-past' : ''}`}>
      {/* Date block */}
      <div className='session-date-block'>
        <span className='session-day'>
          {new Date(session.session_date).toLocaleDateString('en-UG', {
            weekday: 'short',
            timeZone: 'UTC',
          })}
        </span>
        <span className='session-date-num'>
          {new Date(session.session_date).toLocaleDateString('en-UG', {
            day: 'numeric',
            timeZone: 'UTC',
          })}
        </span>
        <span className='session-month'>
          {new Date(session.session_date).toLocaleDateString('en-UG', {
            month: 'short',
            timeZone: 'UTC',
          })}
        </span>
      </div>

      {/* Session details */}
      <div className='session-info'>
        <div className='session-header'>
          <h4 className='session-title'>{session.title}</h4>
          {isPast && (
            <span className='badge badge-blue' style={{ fontSize: '0.65rem' }}>
              Past
            </span>
          )}
        </div>
        <div className='session-meta'>
          <span>🕐 {formattedTime}</span>
          {session.location && <span>📍 {session.location}</span>}
          {session.group_name && <span>📚 {session.group_name}</span>}
        </div>
        {session.description && (
          <p className='session-desc'>{session.description}</p>
        )}
      </div>

      {/* Delete button visible only to the group leader */}
      {isLeader && onDelete && (
        <button
          className='session-delete-btn'
          onClick={() => onDelete(session.id)}
          title='Cancel session'
        >
          ✕
        </button>
      )}
    </div>
  );
}

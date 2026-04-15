// pages/Dashboard.jsx
// Main landing page for logged-in students.
// Shows: welcome banner, quick stats, the user's groups, and upcoming sessions.

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import GroupCard    from "../components/GroupCard.jsx";
import SessionCard  from "../components/SessionCard.jsx";
import "./Dashboard.css";

export default function Dashboard() {
  const { user, authFetch } = useAuth();

  const [myGroups,   setMyGroups]   = useState([]);
  const [sessions,   setSessions]   = useState([]);
  const [allGroups,  setAllGroups]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [joining,    setJoining]    = useState(null);  // id of group being joined
  const [message,    setMessage]    = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    try {
      // Fetch all three data points in parallel
      const [myRes, sessionRes, allRes] = await Promise.all([
        authFetch("/api/groups/my/groups"),
        authFetch("/api/sessions/upcoming"),
        authFetch("/api/groups")
      ]);

      const [myData, sessionData, allData] = await Promise.all([
        myRes.json(), sessionRes.json(), allRes.json()
      ]);

      setMyGroups(Array.isArray(myData)     ? myData     : []);
      setSessions(Array.isArray(sessionData)? sessionData: []);
      setAllGroups(Array.isArray(allData)   ? allData    : []);
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin(groupId) {
    setJoining(groupId);
    setMessage("");
    try {
      const res  = await authFetch(`/api/groups/${groupId}/join`, { method: "POST" });
      const data = await res.json();
      setMessage(data.message);
      if (res.ok) loadDashboard(); // refresh data after joining
    } catch {
      setMessage("Failed to join group.");
    } finally {
      setJoining(null);
    }
  }

  // Build a Set of group IDs the user already belongs to for quick lookup
  const myGroupIds = new Set(myGroups.map(g => g.id));

  // Suggested groups = groups the user hasn't joined yet (max 3 suggestions)
  const suggestedGroups = allGroups
    .filter(g => !myGroupIds.has(g.id))
    .slice(0, 3);

  if (loading) return <div className="spinner" />;

  return (
    <div className="page-enter page-content">
      <div className="container">

        {/* ── Welcome Banner ─────────────────────────────────── */}
        <div className="dashboard-banner">
          <div className="banner-text">
            <h1 className="banner-title">
              Good day, <span className="text-accent">{user?.name?.split(" ")[0]}</span> 👋
            </h1>
            <p className="banner-sub">
              {user?.program} · Year {user?.year_of_study}
            </p>
          </div>
          <Link to="/groups" className="btn btn-primary">
            + Create / Find Group
          </Link>
        </div>

        {message && <div className="alert alert-success" style={{ marginBottom: "1rem" }}>{message}</div>}

        {/* ── Quick Stats ────────────────────────────────────── */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-number">{myGroups.length}</div>
            <div className="stat-label">My Groups</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-number">{sessions.length}</div>
            <div className="stat-label">Upcoming Sessions</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔍</div>
            <div className="stat-number">{allGroups.length}</div>
            <div className="stat-label">Total Groups</div>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* ── Left column ──────────────────────────────────── */}
          <div className="dashboard-col">

            {/* My Groups */}
            <section>
              <div className="section-header">
                <div>
                  <h2 className="section-title">My Study Groups</h2>
                  <p className="section-subtitle">Groups you are currently a member of</p>
                </div>
                <Link to="/groups" className="btn btn-ghost btn-sm">View all</Link>
              </div>

              {myGroups.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🤝</div>
                  <h3>No groups yet</h3>
                  <p>Browse groups or create your own to get started.</p>
                  <Link to="/groups" className="btn btn-primary" style={{ marginTop: "1rem" }}>
                    Find Groups
                  </Link>
                </div>
              ) : (
                <div className="groups-list">
                  {myGroups.map(group => (
                    <GroupCard
                      key={group.id}
                      group={group}
                      isMember={true}
                    />
                  ))}
                </div>
              )}
            </section>

          </div>

          {/* ── Right column ─────────────────────────────────── */}
          <div className="dashboard-col">

            {/* Upcoming sessions */}
            <section>
              <div className="section-header">
                <div>
                  <h2 className="section-title">Upcoming Sessions</h2>
                  <p className="section-subtitle">Scheduled study meetings in your groups</p>
                </div>
              </div>

              {sessions.length === 0 ? (
                <div className="empty-state" style={{ padding: "2rem" }}>
                  <div className="empty-icon">📅</div>
                  <h3>No sessions scheduled</h3>
                  <p>Group leaders can schedule sessions from the group page.</p>
                </div>
              ) : (
                <div className="sessions-list">
                  {sessions.map(s => (
                    <SessionCard key={s.id} session={s} />
                  ))}
                </div>
              )}
            </section>

            {/* Suggested groups */}
            {suggestedGroups.length > 0 && (
              <section style={{ marginTop: "var(--space-8)" }}>
                <div className="section-header">
                  <div>
                    <h2 className="section-title">Suggested for you</h2>
                    <p className="section-subtitle">Groups you haven't joined yet</p>
                  </div>
                </div>
                <div className="sessions-list">
                  {suggestedGroups.map(group => (
                    <GroupCard
                      key={group.id}
                      group={group}
                      isMember={false}
                      onJoin={handleJoin}
                      joining={joining}
                    />
                  ))}
                </div>
              </section>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

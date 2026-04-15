import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Groups from './pages/Groups.jsx';
import GroupDetail from './pages/GroupDetail.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

// ── ProtectedRoute wrapper ───────────────────────────────────
// Renders children only if user is logged in; otherwise redirects to /login
function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useAuth();
  if (!user) return <Navigate to='/login' replace />;
  if (adminOnly && user.role !== 'admin')
    return <Navigate to='/dashboard' replace />;
  return children;
}

export default function App() {
  const { user } = useAuth();

  return (
    <>
      {/* Show the nav bar only when the user is logged in */}
      {user && <Navbar />}

      <Routes>
        {/* Public routes */}
        <Route
          path='/login'
          element={user ? <Navigate to='/dashboard' /> : <Login />}
        />
        <Route
          path='/register'
          element={user ? <Navigate to='/dashboard' /> : <Register />}
        />

        {/* Default redirect */}
        <Route
          path='/'
          element={<Navigate to={user ? '/dashboard' : '/login'} />}
        />

        {/* Protected student routes */}
        <Route
          path='/dashboard'
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path='/groups'
          element={
            <ProtectedRoute>
              <Groups />
            </ProtectedRoute>
          }
        />
        <Route
          path='/groups/:id'
          element={
            <ProtectedRoute>
              <GroupDetail />
            </ProtectedRoute>
          }
        />

        {/* Admin-only route */}
        <Route
          path='/admin'
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch-all 404 */}
        <Route
          path='*'
          element={
            <div className='empty-state page-content'>
              <div className='empty-icon'>🔍</div>
              <h3>Page not found</h3>
              <p>The page you're looking for doesn't exist.</p>
            </div>
          }
        />
      </Routes>
    </>
  );
}

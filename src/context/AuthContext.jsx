import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Custom hook for convenient access to auth context
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  // Initialize user from localStorage so they stay logged in on refresh
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('sgf_user');
    return stored ? JSON.parse(stored) : null;
  });

  const [token, setToken] = useState(
    () => localStorage.getItem('sgf_token') || null,
  );

  // ── Login: store token and user in state + localStorage
  function login(userData, authToken) {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('sgf_user', JSON.stringify(userData));
    localStorage.setItem('sgf_token', authToken);
  }

  // ── Logout: clear everything
  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem('sgf_user');
    localStorage.removeItem('sgf_token');
  }

  // ── API helper: attach auth header automatically to every fetch call
  async function authFetch(url, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };
    const res = await fetch(url, { ...options, headers });

    // If the server says the token is expired/invalid, auto-logout
    if (res.status === 401) {
      logout();
      throw new Error('Session expired. Please log in again.');
    }

    return res;
  }

  const value = {
    user,
    token,
    login,
    logout,
    authFetch,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

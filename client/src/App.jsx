import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Home from './pages/Home.jsx';
import Signup from './signup.jsx';
import Login from './login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import apiClient from './api/client.js';
import logo from './assets/leaseanddesistlogo.png';

const STORAGE_KEY = 'leaseanddesist_user';

function getStoredUser() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn('Failed to parse stored auth data', err);
    return null;
  }
}

function App() {
  const [auth, setAuth] = useState(() => ({
    token: null,
    user: getStoredUser(),
  }));
  const [isBootstrapped, setIsBootstrapped] = useState(false);

  useEffect(() => {
    if (auth?.token) {
      apiClient.defaults.headers.common.Authorization = `Bearer ${auth.token}`;
    } else {
      delete apiClient.defaults.headers.common.Authorization;
    }
  }, [auth?.token]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (auth?.user) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(auth.user));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [auth?.user]);

  const attemptRefresh = useCallback(async () => {
    try {
      const { data } = await apiClient.post('/api/auth/refresh');
      if (data?.accessToken && data?.user) {
        setAuth({ token: data.accessToken, user: data.user });
        return true;
      }
    } catch (err) {
      console.warn('Refresh failed', err);
    } finally {
      setIsBootstrapped(true);
    }
    setAuth({ token: null, user: null });
    return false;
  }, []);

  useEffect(() => {
    attemptRefresh();
  }, [attemptRefresh]);

  const handleAuthSuccess = (data) => {
    if (!data) return;
    setAuth({ token: data.accessToken ?? null, user: data.user ?? null });
    setIsBootstrapped(true);
  };

  const handleLogout = async () => {
    try {
      await apiClient.post('/api/auth/logout');
    } catch (err) {
      console.warn('Logout request failed', err);
    } finally {
      setAuth({ token: null, user: null });
    }
  };

  const isAuthenticated = useMemo(() => Boolean(auth?.token && auth?.user), [auth]);

  return (
    <BrowserRouter>
      <div className="app-shell">
        <header className="app-header">
          <nav className="nav">
            <Link to="/" className="nav-logo" aria-label="Lease and Desist home">
              <img src={logo} alt="Lease and Desist logo" />
            </Link>
            <div className="nav-links">
              <Link to="/" className="nav-link">Home</Link>
              {!isAuthenticated && (
                <>
                  <Link to="/login" className="nav-link">Login</Link>
                  <Link to="/signup" className="nav-link">Sign Up</Link>
                </>
              )}
              {isAuthenticated && (
                <>
                  <Link to="/dashboard" className="nav-link">Dashboard</Link>
                  <button type="button" className="link-button" onClick={handleLogout}>
                    Log Out
                  </button>
                </>
              )}
            </div>
          </nav>
        </header>

        <main className="app-main">
          {!isBootstrapped ? (
            <div className="page">
              <p>Loading session…</p>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={<Home auth={auth} />} />
              <Route path="/dashboard" element={<Dashboard auth={auth} />} />
              <Route path="/signup" element={<Signup onAuthSuccess={handleAuthSuccess} />} />
              <Route path="/login" element={<Login onAuthSuccess={handleAuthSuccess} />} />
            </Routes>
          )}
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;

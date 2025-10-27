import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client.js';
import logo from '../assets/leaseanddesistlogo.png';

function Home({ auth }) {
  const [message, setMessage] = useState('Loading...');
  const [error, setError] = useState('');
  const isAuthenticated = useMemo(() => Boolean(auth?.user), [auth]);

  useEffect(() => {
    let isMounted = true;

    const fetchMessage = async () => {
      try {
        const response = await apiClient.get('/api');
        if (isMounted) {
          setMessage(response.data.message || 'Welcome!');
          setError('');
        }
      } catch (err) {
        console.error('Failed to fetch API message', err);
        if (isMounted) {
          setError('Unable to reach the API right now.');
        }
      }
    };

    fetchMessage();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="page home-page">
      <img src={logo} alt="Lease and Desist logo" className="home-logo" />
      <h1>Lease &amp; Desist</h1>
      {isAuthenticated ? (
        <>
          <p>Signed in as <strong>{auth.user.email}</strong></p>
          <Link to="/dashboard" className="secondary-button">Go to dashboard</Link>
        </>
      ) : (
        <p>You are browsing as a guest.</p>
      )}
      {error ? <p className="error">{error}</p> : <p>{message}</p>}
    </div>
  );
}

export default Home;

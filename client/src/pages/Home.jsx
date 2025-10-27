import { useEffect, useState } from 'react';
import apiClient from '../api/client.js';

function Home({ auth }) {
  const [message, setMessage] = useState('Loading...');
  const [error, setError] = useState('');

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
    <div className="page">
      <h1>Lease &amp; Desist</h1>
      {auth?.user ? <p>Signed in as <strong>{auth.user.email}</strong></p> : <p>You are browsing as a guest.</p>}
      {error ? <p className="error">{error}</p> : <p>{message}</p>}
    </div>
  );
}

export default Home;

import axios from 'axios';
import { useEffect, useState } from 'react';

function App() {
  const [msg, setMsg] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/api')
      .then(res => setMsg(res.data.message))
      .catch(err => console.error(err));
  }, []);

  return <h1>{msg}</h1>;
}

export default App;

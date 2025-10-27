import React, { useEffect, useState } from 'react'
import api from '../api/axios'

export default function Dashboard() {
  const [message, setMessage] = useState('Loading...')
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  useEffect(() => {
    const fetchPing = async () => {
      try {
        const res = await api.get('/api/ping')
        setMessage(res.data?.ok ? 'API reachable' : 'API responded')
      } catch (err) {
        setMessage('Cannot reach API')
      }
    }
    fetchPing()
  }, [])

  return (
    <div>
      <h2>Dashboard</h2>
      {user ? (
        <div>
          <p>Welcome, {user.name}</p>
          <p>{message}</p>
        </div>
      ) : (
        <div>
          <p>You are not logged in.</p>
          <p>{message}</p>
        </div>
      )}
    </div>
  )
}

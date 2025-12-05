import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Header(){
  const { user, logout } = useAuth()
  const nav = useNavigate()

  const doLogout = () => { logout(); nav('/login') }

  return (
    <header className="app-header">
      <Link data-cy="nav-dashboard" to="/dashboard" className="brand">
        <span className="logo-mark" aria-hidden>✶</span>
        LeaseAndDesist
      </Link>
      <nav>
        {user ? (
          <>
            <Link data-cy="nav-goals" to="/goals">Goals</Link>
            <Link data-cy="nav-challenges" to="/challenges">Challenges</Link>
            <button data-cy="nav-logout" onClick={doLogout} className="link-like">Logout</button>
          </>
        ) : (
          <Link data-cy="nav-login" to="/login">Login</Link>
        )}
      </nav>
    </header>
  )
}

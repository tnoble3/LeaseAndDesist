import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

export default function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Lease and Desist</h1>
        <p className="tagline">A friendly messaging app for renters</p>
      </header>

      <nav className="top-nav">
        <Link to="/signup">Signup</Link>
        <Link to="/login">Login</Link>
        <Link to="/dashboard">Dashboard</Link>
      </nav>

      <main>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Signup />} />
        </Routes>
      </main>
    </div>
  )
}

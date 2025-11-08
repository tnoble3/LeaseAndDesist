import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Goals from './pages/Goals'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './context/AuthContext'

export default function App(){
  const { user, logout } = useAuth()

  return (
    <div className="app-root">
      <nav className="top-nav">
        <Link to="/">Home</Link>
        {!user ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        ) : (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/goals">Goals</Link>
            <button onClick={logout}>Logout</button>
          </>
        )}
      </nav>

      <main>
        <Routes>
          <Route path="/" element={<div style={{padding:20}}>Welcome to Lease and Desist</div>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/register" element={<Register/>} />

          <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />
          <Route path="/goals" element={<ProtectedRoute><Goals/></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  )
}

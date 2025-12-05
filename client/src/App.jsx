import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Goals from './pages/Goals'
import Challenges from './pages/Challenges'
import ProtectedRoute from './components/ProtectedRoute'
import Header from './components/Header'

export default function App(){
  return (
    <div className="app-root">
      <Header />
      <main>
        <Routes>
          <Route path="/login" element={<Login/>} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />
          <Route path="/goals" element={<ProtectedRoute><Goals/></ProtectedRoute>} />
          <Route path="/challenges" element={<ProtectedRoute><Challenges/></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  )
}

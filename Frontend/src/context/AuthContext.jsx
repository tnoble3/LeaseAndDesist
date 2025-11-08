import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext()

export function AuthProvider({ children }){
  const [user, setUser] = useState(()=>{
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  })

  useEffect(()=>{
    // keep user in sync
    if(user) localStorage.setItem('user', JSON.stringify(user))
    else localStorage.removeItem('user')
  },[user])

  const login = async ({ email, password }) => {
    const res = await api.post('/api/users/login', { email, password })
    const { token, user: u } = res.data
    localStorage.setItem('token', token)
    setUser(u)
    return u
  }

  const register = async ({ name, email, password }) => {
    const res = await api.post('/api/users/register', { name, email, password })
    const { token, user: u } = res.data
    localStorage.setItem('token', token)
    setUser(u)
    return u
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

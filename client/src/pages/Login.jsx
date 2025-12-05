import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login(){
  const [isRegister, setIsRegister] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const { login, register } = useAuth()
  const nav = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    try {
      if (isRegister) await register(name, email, password)
      else await login(email, password)
      nav('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    }
  }

  return (
    <div className="auth-card">
      <h2>{isRegister ? 'Register' : 'Login'}</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={submit}>
        {isRegister && (
          <input data-cy="auth-name" value={name} onChange={e=>setName(e.target.value)} placeholder="Name" required />
        )}
        <input data-cy="auth-email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" type="email" required />
        <input data-cy="auth-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" required />
        <button data-cy="auth-submit" type="submit">{isRegister ? 'Register' : 'Login'}</button>
      </form>
      <div data-cy="auth-switch" className="switch" onClick={()=>setIsRegister(!isRegister)}>
        {isRegister ? 'Have an account? Login' : "Don't have an account? Register"}
      </div>
    </div>
  )
}

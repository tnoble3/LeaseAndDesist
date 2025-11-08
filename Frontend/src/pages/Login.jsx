import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    try{
      await login({ email, password })
      navigate('/dashboard')
    }catch(err){
      setError(err.response?.data?.message || 'Unable to login')
    }
  }

  return (
    <div style={{maxWidth:420}}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="card" data-testid="login-form">
        <div className="form-row">
          <label>Email</label>
          <input data-testid="input-email" value={email} onChange={e=>setEmail(e.target.value)} />
        </div>
        <div className="form-row">
          <label>Password</label>
          <input data-testid="input-password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        </div>
        {error && <div style={{color:'red'}}>{error}</div>}
        <button type="submit" data-testid="btn-login">Login</button>
      </form>
    </div>
  )
}

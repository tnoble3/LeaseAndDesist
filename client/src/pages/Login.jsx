import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import api from '../api/axios'
import { useNavigate } from 'react-router-dom'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required')
})

export default function Login() {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data) => {
    try {
      const res = await api.post('/api/auth/login', data)
      const { accessToken, user } = res.data
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('user', JSON.stringify(user))
        navigate('/dashboard')
      }
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="auth-form">
      <h2>Login</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label>Email</label>
          <input {...register('email')} />
          <div className="error">{errors.email?.message}</div>
        </div>
        <div>
          <label>Password</label>
          <input type="password" {...register('password')} />
          <div className="error">{errors.password?.message}</div>
        </div>
        <button type="submit" disabled={isSubmitting}>Log in</button>
      </form>
    </div>
  )
}

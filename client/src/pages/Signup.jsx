import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import api from '../api/axios'
import { useNavigate } from 'react-router-dom'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

export default function Signup() {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data) => {
    try {
      const res = await api.post('/api/auth/signup', data)
      const { accessToken, user } = res.data
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('user', JSON.stringify(user))
        navigate('/dashboard')
      }
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || 'Signup failed')
    }
  }

  return (
    <div className="auth-form">
      <h2>Sign up</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label>Name</label>
          <input {...register('name')} />
          <div className="error">{errors.name?.message}</div>
        </div>
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
        <button type="submit" disabled={isSubmitting}>Create account</button>
      </form>
    </div>
  )
}

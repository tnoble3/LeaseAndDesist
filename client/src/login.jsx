import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import apiClient from './api/client.js';
import { useState } from 'react';

const schema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters long.'),
});

function Login({ onAuthSuccess }) {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values) => {
    setServerError('');
    try {
      const response = await apiClient.post('/api/auth/login', values);

      if (onAuthSuccess) {
        onAuthSuccess(response.data);
      }

      navigate('/');
    } catch (err) {
      console.error('Login failed', err);
      const message = err.response?.data?.message || 'Unable to log in right now.';
      setServerError(message);
    }
  };

  return (
    <div className="page auth-page">
      <h2>Log In</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
        <label>
          Email
          <input
            type="email"
            {...register('email')}
            autoComplete="email"
          />
          {errors.email && <span className="error">{errors.email.message}</span>}
        </label>

        <label>
          Password
          <input
            type="password"
            {...register('password')}
            autoComplete="current-password"
          />
          {errors.password && <span className="error">{errors.password.message}</span>}
        </label>

        {serverError && <p className="error">{serverError}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in…' : 'Log In'}
        </button>
      </form>
    </div>
  );
}

export default Login;

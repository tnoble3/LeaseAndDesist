import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import apiClient from './api/client.js';
import { useState } from 'react';

const schema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters long.'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords do not match.',
});

function Signup({ onAuthSuccess }) {
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
      confirmPassword: '',
    },
  });

  const onSubmit = async (values) => {
    setServerError('');
    try {
      const response = await apiClient.post('/api/auth/signup', {
        email: values.email,
        password: values.password,
      });

      if (onAuthSuccess) {
        onAuthSuccess(response.data);
      }

      navigate('/');
    } catch (err) {
      console.error('Signup failed', err);
      const message = err.response?.data?.message || 'Unable to sign up right now.';
      setServerError(message);
    }
  };

  return (
    <div className="page auth-page">
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
        <label>
          Email
          <input
            type="email"
            {...register('email')}
            autoComplete="email"
          />
          {errors.email && <span className="field-error">{errors.email.message}</span>}
        </label>

        <label>
          Password
          <input
            type="password"
            {...register('password')}
            autoComplete="new-password"
          />
          {errors.password && <span className="field-error">{errors.password.message}</span>}
        </label>

        <label>
          Confirm Password
          <input
            type="password"
            {...register('confirmPassword')}
            autoComplete="new-password"
          />
          {errors.confirmPassword && <span className="field-error">{errors.confirmPassword.message}</span>}
        </label>

        {serverError && <p className="error">{serverError}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Signing up…' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
}

export default Signup;

import React from 'react'
import { render, screen } from '@testing-library/react'
import Header from '../components/Header'
import { AuthProvider } from '../context/AuthContext'

test('renders brand and login link when not authenticated', () => {
  // Ensure no user in localStorage
  localStorage.removeItem('user')
  const { container } = render(
    <AuthProvider>
      <Header />
    </AuthProvider>
  )
  expect(screen.getByText(/LeaseAndDesist/i)).toBeInTheDocument()
  expect(screen.getByText(/Login/i)).toBeInTheDocument()
})

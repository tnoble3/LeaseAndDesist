import axios from 'axios'
import { get } from 'lodash'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
})

// Request interceptor: attach token if present
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  } catch (e) {
    // ignore
  }
  return config
}, (error) => Promise.reject(error))

// Response interceptor: normalize errors and handle 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = get(error, 'response.status')
    const message = get(error, 'response.data.message') || error.message
    if (status === 401) {
      try {
        // clear local auth; UI should handle redirect
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      } catch (e) {}
    }
    // attach a friendlier message
    const err = new Error(message)
    err.status = status
    err.response = error.response
    return Promise.reject(err)
  }
)

export default api

import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true
})

// attach access token from localStorage if present
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('accessToken')
  if (token) cfg.headers = { ...cfg.headers, Authorization: `Bearer ${token}` }
  return cfg
})

export default api

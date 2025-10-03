import axios from 'axios'

// API Client Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
const ACTIVE_USER_STORAGE_KEY = 'prism-active-user-id'

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
})

// Request interceptor to add user ID header
api.interceptors.request.use(
  (config) => {
    // Add x-user-id header from localStorage
    if (typeof window !== 'undefined') {
      const activeUserId = window.localStorage.getItem(ACTIVE_USER_STORAGE_KEY)
      if (activeUserId) {
        config.headers['x-user-id'] = activeUserId
      }
    }

    // Logging in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`)
    }

    return config
  },
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('🔴 API Request Error:', error)
    }
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`)
    }
    return response
  },
  (error) => {
    console.error('🔴 API Response Error:', error.response?.data || error.message)

    // Handle different error types
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.error('Unauthorized access - redirect to login')
    } else if (error.response?.status === 500) {
      // Handle server errors
      console.error('Server error - show user-friendly message')
    }

    return Promise.reject(error)
  }
)

export default api
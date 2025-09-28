import axios from 'axios'

// API Client Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
})

// Request interceptor for logging (development only)
if (process.env.NODE_ENV === 'development') {
  api.interceptors.request.use(
    (config) => {
      console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`)
      return config
    },
    (error) => {
      console.error('🔴 API Request Error:', error)
      return Promise.reject(error)
    }
  )
}

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
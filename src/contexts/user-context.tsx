'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

type UserType = 'AGENT' | 'ADMINISTRATOR'

type User = {
  id: string
  name: string
  email: string
  profilePictureUrl: string | null
  division: string | null
  costCenter: string | null
  userType: UserType
  defaultFilterType: string | null
  defaultFilterValue: string | null
}

type UserProviderProps = {
  children: React.ReactNode
}

type UserProviderState = {
  activeUserId: string | null
  user: User | null
  isLoading: boolean
  availableUsers: User[]
  updateUser: (updates: Partial<User>) => Promise<void>
  refetchUser: () => Promise<void>
  switchUser: (userId: string) => Promise<void>
  refreshUsers: () => Promise<void>
}

const initialState: UserProviderState = {
  activeUserId: null,
  user: null,
  isLoading: true,
  availableUsers: [],
  updateUser: async () => {},
  refetchUser: async () => {},
  switchUser: async () => {},
  refreshUsers: async () => {},
}

const UserProviderContext = createContext<UserProviderState>(initialState)

export function UserProvider({ children, ...props }: UserProviderProps) {
  const ACTIVE_USER_STORAGE_KEY = 'prism-active-user-id'
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    'http://localhost:3001'
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [activeUserId, setActiveUserId] = useState<string | null>(null)
  const isInitialised = useRef(false)

  const fetchUser = useCallback(async (userIdOverride?: string) => {
    setIsLoading(true)
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }

      const idToUse = userIdOverride || activeUserId

      if (idToUse) {
        headers['x-user-id'] = idToUse
      }

      const response = await fetch(`${API_BASE_URL}/api/users/me`, {
        headers,
      })
      const data = await response.json()

      if (data.success && data.data) {
        setUser(data.data)
        if (data.data.id) {
          setActiveUserId(data.data.id)
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(ACTIVE_USER_STORAGE_KEY, data.data.id)
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
    } finally {
      setIsLoading(false)
    }
  }, [API_BASE_URL, ACTIVE_USER_STORAGE_KEY, activeUserId])

  const fetchUsers = useCallback(async (userIdOverride?: string) => {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }

      const idToUse = userIdOverride || activeUserId

      if (idToUse) {
        headers['x-user-id'] = idToUse
      }

      const response = await fetch(`${API_BASE_URL}/api/users`, {
        headers,
      })

      const data = await response.json()

      if (data.success && Array.isArray(data.data)) {
        setAvailableUsers(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }, [API_BASE_URL, activeUserId])

  const updateUser = async (updates: Partial<User>) => {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }

      if (activeUserId) {
        headers['x-user-id'] = activeUserId
      }

      const response = await fetch(`${API_BASE_URL}/api/users/me`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ ...user, ...updates }),
      })

      const data = await response.json()

      if (data.success && data.data) {
        setUser(data.data)
        await fetchUsers()
      }
    } catch (error) {
      console.error('Failed to update user:', error)
      throw error
    }
  }

  const refetchUser = useCallback(async () => {
    await fetchUser()
  }, [fetchUser])

  const switchUser = useCallback(async (userId: string) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(ACTIVE_USER_STORAGE_KEY, userId)
    }
    setActiveUserId(userId)
    await fetchUser(userId)
    await fetchUsers(userId)
  }, [fetchUser, fetchUsers, ACTIVE_USER_STORAGE_KEY])

  useEffect(() => {
    if (isInitialised.current) {
      return
    }

    isInitialised.current = true

    const storedId = typeof window !== 'undefined'
      ? window.localStorage.getItem(ACTIVE_USER_STORAGE_KEY)
      : null

    fetchUser(storedId || undefined)
    fetchUsers(storedId || undefined)
  }, [fetchUser, fetchUsers])

  const value = {
    activeUserId,
    user,
    isLoading,
    availableUsers,
    updateUser,
    refetchUser,
    switchUser,
    refreshUsers: async () => fetchUsers(),
  }

  return (
    <UserProviderContext.Provider {...props} value={value}>
      {children}
    </UserProviderContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserProviderContext)

  if (context === undefined)
    throw new Error('useUser must be used within a UserProvider')

  return context
}

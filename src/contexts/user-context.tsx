'use client'

import { createContext, useContext, useEffect, useState } from 'react'

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
  user: User | null
  isLoading: boolean
  updateUser: (updates: Partial<User>) => Promise<void>
  refetchUser: () => Promise<void>
}

const initialState: UserProviderState = {
  user: null,
  isLoading: true,
  updateUser: async () => {},
  refetchUser: async () => {},
}

const UserProviderContext = createContext<UserProviderState>(initialState)

export function UserProvider({ children, ...props }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUser = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/users/me')
      const data = await response.json()

      if (data.success && data.data) {
        setUser(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateUser = async (updates: Partial<User>) => {
    try {
      const response = await fetch('http://localhost:3001/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...user, ...updates }),
      })

      const data = await response.json()

      if (data.success && data.data) {
        setUser(data.data)
      }
    } catch (error) {
      console.error('Failed to update user:', error)
      throw error
    }
  }

  const refetchUser = async () => {
    await fetchUser()
  }

  useEffect(() => {
    fetchUser()
  }, [])

  const value = {
    user,
    isLoading,
    updateUser,
    refetchUser,
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

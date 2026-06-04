import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api } from '@/services/api'
import { User } from '@/types'
import toast from 'react-hot-toast'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      try {
        if (api.isAuthenticated()) {
          const userData = await api.getCurrentUser()
          setUser(userData)
        }
      } catch (error) {
        console.error('Failed to load user:', error)
        api.clearTokens()
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const response = await api.login({ email, password })
      setUser(response.user)
      toast.success('Login successful!')
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Login failed')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await api.logout()
    } finally {
      setUser(null)
      api.clearTokens()
      toast.success('Logged out successfully')
    }
  }

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
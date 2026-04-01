import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { User } from '../types'

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCustomer: boolean;
  login: (authResponse: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const navigate = useNavigate()

  // Load auth state from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('smartsure-token')
    const savedUser = localStorage.getItem('smartsure-user')
    if (savedToken && savedUser) {
      try {
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem('smartsure-token')
        localStorage.removeItem('smartsure-user')
        localStorage.removeItem('smartsure-refresh-token')
      }
    }
    setLoading(false)
  }, [])

  const login = (authResponse: any) => {
    // authResponse = { token, role, id, name }
    const userData: User = {
      id: authResponse.id,
      role: authResponse.role,
      name: authResponse.name,
    }
    setToken(authResponse.token)
    setUser(userData)

    localStorage.setItem('smartsure-token', authResponse.token)
    localStorage.setItem('smartsure-refresh-token', authResponse.refreshToken)
    localStorage.setItem('smartsure-user', JSON.stringify(userData))

    // Redirect based on role
    if (authResponse.role === 'ADMIN') {
      navigate('/admin/dashboard')
    } else {
      navigate('/dashboard')
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('smartsure-token')
    localStorage.removeItem('smartsure-user')
    localStorage.removeItem('smartsure-refresh-token')
    navigate('/login')
  }

  const isAuthenticated = !!token
  const isAdmin = user?.role === 'ADMIN'
  const isCustomer = user?.role === 'CUSTOMER'

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated,
      isAdmin,
      isCustomer,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

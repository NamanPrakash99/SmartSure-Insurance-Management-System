import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
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
      }
    }
    setLoading(false)
  }, [])

  const login = (authResponse) => {
    // authResponse = { token, role, id, name }
    const userData = {
      id: authResponse.id,
      role: authResponse.role,
      name: authResponse.name,
    }
    setToken(authResponse.token)
    setUser(userData)

    localStorage.setItem('smartsure-token', authResponse.token)
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

export const useAuth = () => useContext(AuthContext)

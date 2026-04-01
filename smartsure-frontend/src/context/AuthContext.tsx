import { createContext, useContext, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { User } from '../types'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { loginSuccess, logout as logoutAction } from '../store/slices/authSlice'

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
  const { user, token, isAuthenticated, isAdmin, isCustomer } = useAppSelector(state => state.auth)
  const dispatch = useAppDispatch()
  const loading = false // Redux state is synchronous for initial load here
  const navigate = useNavigate()

  // We can remove the local mount logic as Redux slice handles it in loadInitialState
  // useEffect(() => { ... }, [])

  const login = (authResponse: any) => {
    const userData: User = {
      id: authResponse.id,
      role: authResponse.role,
      name: authResponse.name,
    }
    
    dispatch(loginSuccess({ 
      user: userData, 
      token: authResponse.token, 
      refreshToken: authResponse.refreshToken 
    }))

    if (authResponse.role === 'ADMIN') {
      navigate('/admin/dashboard')
    } else {
      navigate('/dashboard')
    }
  }

  const logout = () => {
    dispatch(logoutAction())
    navigate('/login')
  }

  // These are now derived from Redux state

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

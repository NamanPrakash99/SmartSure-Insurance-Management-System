import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCustomer: boolean;
}

// Helper to load initial state from localStorage safely
const loadInitialState = (): AuthState => {
  try {
    const savedToken = localStorage.getItem('smartsure-token');
    const savedUser = localStorage.getItem('smartsure-user');
    
    if (savedToken && savedUser) {
      const user: User = JSON.parse(savedUser);
      return {
        user,
        token: savedToken,
        isAuthenticated: true,
        isAdmin: user.role === 'ADMIN',
        isCustomer: user.role === 'CUSTOMER',
      };
    }
  } catch (error) {
    // If JSON parsing fails, clear bad data
    localStorage.removeItem('smartsure-token');
    localStorage.removeItem('smartsure-user');
    localStorage.removeItem('smartsure-refresh-token');
  }

  return {
    user: null,
    token: null,
    isAuthenticated: false,
    isAdmin: false,
    isCustomer: false,
  };
};

const initialState: AuthState = loadInitialState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string; refreshToken?: string }>) => {
      const { user, token, refreshToken } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.isAdmin = user.role === 'ADMIN';
      state.isCustomer = user.role === 'CUSTOMER';

      localStorage.setItem('smartsure-token', token);
      if (refreshToken) {
        localStorage.setItem('smartsure-refresh-token', refreshToken);
      }
      localStorage.setItem('smartsure-user', JSON.stringify(user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isAdmin = false;
      state.isCustomer = false;

      localStorage.removeItem('smartsure-token');
      localStorage.removeItem('smartsure-refresh-token');
      localStorage.removeItem('smartsure-user');
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;

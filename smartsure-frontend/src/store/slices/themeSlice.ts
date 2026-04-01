import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ThemeState {
  isDark: boolean;
}

const loadInitialTheme = (): boolean => {
  const saved = localStorage.getItem('smartsure-theme');
  if (saved) return saved === 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const initialState: ThemeState = {
  isDark: loadInitialTheme(),
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.isDark = !state.isDark;
      
      // Update DOM and LocalStorage within the slice
      const root = document.documentElement;
      if (state.isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      localStorage.setItem('smartsure-theme', state.isDark ? 'dark' : 'light');
    },
    // Useful if we need to explicitly set it
    setTheme: (state, action: PayloadAction<boolean>) => {
      state.isDark = action.payload;
      const root = document.documentElement;
      if (state.isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      localStorage.setItem('smartsure-theme', state.isDark ? 'dark' : 'light');
    }
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;

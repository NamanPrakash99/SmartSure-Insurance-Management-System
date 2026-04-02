import { createContext, useContext, ReactNode, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { toggleTheme as toggleAction } from '../store/slices/themeSlice'

interface ThemeContextType {
  isDark: boolean
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const isDark = useAppSelector(state => state.theme.isDark)
  const dispatch = useAppDispatch()
  const toggleTheme = () => dispatch(toggleAction())

  // Ensure DOM is in sync with Redux state on boot and changes
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

import { createContext, useContext, ReactNode } from 'react'
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

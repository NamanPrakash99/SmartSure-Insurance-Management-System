import { useState, useEffect } from 'react'

/**
 * Custom hook that delays updating a value until a specified delay has passed.
 * Used for debouncing search inputs to improve performance and reduce API load.
 * 
 * @param value The value to debounce
 * @param delay The delay in milliseconds (default: 500ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Set a timeout to update the debounced value after the delay
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Clear the timeout if the value changes during the delay period
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Button } from './Button'

describe('Button Component', () => {
  it('renders correctly with children', () => {
    render(<Button>Click Me</Button>)
    expect(screen.getByText('Click Me')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click Me</Button>)
    fireEvent.click(screen.getByText('Click Me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when the disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>)
    expect(screen.getByText('Disabled Button')).toBeDisabled()
  })

  it('shows loading spinner when isLoading is true', () => {
    render(<Button isLoading>Action</Button>)
    expect(screen.queryByText('Action')).not.toBeInTheDocument()
    const svg = document.querySelector('svg.animate-spin')
    expect(svg).toBeInTheDocument()
  })

  it('renders with correct variant classes', () => {
    const { container } = render(<Button variant="danger">Danger</Button>)
    expect(container.firstChild).toHaveClass('bg-red-600')
  })
})

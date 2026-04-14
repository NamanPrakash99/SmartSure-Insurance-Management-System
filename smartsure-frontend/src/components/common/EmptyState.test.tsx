import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { EmptyState } from './EmptyState'
import { BrowserRouter } from 'react-router-dom'

// Helper to wrap component with Router since EmptyState uses <Link>
const renderWithRouter = (ui: React.ReactElement) => {
  return render(ui, { wrapper: BrowserRouter })
}

describe('EmptyState Component', () => {
  it('renders with default message', () => {
    renderWithRouter(<EmptyState />)
    expect(screen.getByText('Nothing here yet')).toBeInTheDocument()
  })

  it('renders custom title and description', () => {
    renderWithRouter(
      <EmptyState 
        title="No Policies Found" 
        description="Try adjusting your filters." 
      />
    )
    expect(screen.getByText('No Policies Found')).toBeInTheDocument()
    expect(screen.getByText('Try adjusting your filters.')).toBeInTheDocument()
  })

  it('renders action button and handles click', () => {
    const handleClick = vi.fn()
    renderWithRouter(
      <EmptyState 
        actionLabel="Create Policy" 
        onClick={handleClick} 
      />
    )
    
    const button = screen.getByText('Create Policy')
    fireEvent.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('renders functional link when actionTo is provided', () => {
    renderWithRouter(
      <EmptyState 
        actionLabel="Go Home" 
        actionTo="/" 
      />
    )
    
    const link = screen.getByRole('link', { name: 'Go Home' })
    expect(link).toHaveAttribute('href', '/')
  })
})

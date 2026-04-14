import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { StatusBadge } from './StatusBadge'

describe('StatusBadge Component', () => {
  it('renders ACTIVE status correctly', () => {
    render(<StatusBadge status="ACTIVE" />)
    const badge = screen.getByText('Active')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('text-emerald-700')
  })

  it('renders REJECTED status correctly', () => {
    render(<StatusBadge status="REJECTED" />)
    const badge = screen.getByText('Rejected')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('text-red-700')
  })

  it('formats snake_case status correctly', () => {
    render(<StatusBadge status="UNDER_REVIEW" />)
    expect(screen.getByText('Under Review')).toBeInTheDocument()
  })

  it('falls back to default config for unknown status', () => {
    render(<StatusBadge status="UNKNOWN_STATE" />)
    expect(screen.getByText('Unknown State')).toBeInTheDocument()
  })
})

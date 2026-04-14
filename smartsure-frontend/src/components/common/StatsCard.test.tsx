import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { StatsCard } from './StatsCard'
import { HiOutlineShieldCheck } from 'react-icons/hi'

describe('StatsCard Component', () => {
  it('renders title and value correctly', () => {
    render(
      <StatsCard 
        title="Active Policies" 
        value={5} 
        icon={HiOutlineShieldCheck} 
      />
    )
    
    expect(screen.getByText('Active Policies')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('renders with different colors', () => {
    const { container } = render(
      <StatsCard 
        title="Revenue" 
        value="10k" 
        icon={HiOutlineShieldCheck} 
        color="green" 
      />
    )
    
    // FIXED: Changed emerald to green to match StatsCard.tsx
    const iconContainer = container.querySelector('.text-green-600')
    expect(iconContainer).toBeInTheDocument()
  })

  it('displays the trend percentage when provided', () => {
    render(
      <StatsCard 
        title="Users" 
        value="50k" 
        icon={HiOutlineShieldCheck} 
        trend="+12%" 
      />
    )
    
    // Check if the trend text exists
    expect(screen.getByText('+12%')).toBeInTheDocument()
  })
})

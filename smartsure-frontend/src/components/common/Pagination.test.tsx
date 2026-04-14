import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Pagination } from './Pagination'

describe('Pagination Component', () => {
  it('displays the current page and total pages', () => {
    render(
      <Pagination 
        currentPage={2} 
        totalItems={50} 
        itemsPerPage={10} 
        onPageChange={() => {}} 
      />
    )
    
    // Page 2 of 5 (50 items / 10 per page)
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('calls onPageChange when clicking next', () => {
    const handlePageChange = vi.fn()
    render(
      <Pagination 
        currentPage={1} 
        totalItems={30} 
        itemsPerPage={10} 
        onPageChange={handlePageChange} 
      />
    )
    
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)
    
    expect(handlePageChange).toHaveBeenCalledWith(2)
  })

  it('disables previous button on first page', () => {
    render(
      <Pagination 
        currentPage={1} 
        totalItems={30} 
        itemsPerPage={10} 
        onPageChange={() => {}} 
      />
    )
    
    const prevButton = screen.getByText('Previous').closest('button')
    expect(prevButton).toBeDisabled()
  })

  it('disables next button on last page', () => {
    render(
      <Pagination 
        currentPage={3} 
        totalItems={30} 
        itemsPerPage={10} 
        onPageChange={() => {}} 
      />
    )
    
    const nextButton = screen.getByText('Next').closest('button')
    expect(nextButton).toBeDisabled()
  })
})

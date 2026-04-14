import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { FormInput } from './FormInput'

describe('FormInput Component', () => {
  it('renders with the correct label', () => {
    render(<FormInput label="Email Address" name="email" />)
    expect(screen.getByText('Email Address')).toBeInTheDocument()
  })

  it('allows the user to type into the input', async () => {
    const user = userEvent.setup()
    render(<FormInput label="Username" name="username" />)
    
    const input = screen.getByRole('textbox')
    await user.type(input, 'testuser')
    
    expect(input).toHaveValue('testuser')
  })

  it('shows an error message when the error prop is provided', () => {
    render(<FormInput label="Password" name="password" error="Password is too short" />)
    expect(screen.getByText('Password is too short')).toBeInTheDocument()
  })

  it('is disabled when the disabled prop is true', () => {
    render(<FormInput label="Username" name="username" disabled />)
    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
  })
})

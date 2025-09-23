import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import LoadingSpinner from '../../components/LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders loading spinner and message', () => {
    render(<LoadingSpinner />)

    // Check if the loading message is displayed
    expect(screen.getByText('Brewing up your recipe...')).toBeInTheDocument()

    // Check if the spinner element is present
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })
})
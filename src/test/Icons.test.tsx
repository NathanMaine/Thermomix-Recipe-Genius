import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ChefHatIcon, ConvertIcon, ClockIcon, UsersIcon, ThermomixIcon } from '../../components/Icons'

describe('Icons', () => {
  it('renders ChefHatIcon with custom className', () => {
    const { container } = render(<ChefHatIcon className="test-class" />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveClass('test-class')
  })

  it('renders ConvertIcon', () => {
    const { container } = render(<ConvertIcon />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('renders ClockIcon', () => {
    const { container } = render(<ClockIcon />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('renders UsersIcon', () => {
    const { container } = render(<UsersIcon />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('renders ThermomixIcon', () => {
    const { container } = render(<ThermomixIcon />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })
})
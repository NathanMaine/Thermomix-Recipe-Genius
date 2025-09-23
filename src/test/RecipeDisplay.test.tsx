import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import RecipeDisplay from '../../components/RecipeDisplay'
import { ThermomixRecipe } from '../../types'

const mockRecipe: ThermomixRecipe = {
  title: 'Test Recipe',
  description: 'A delicious test recipe',
  servings: '4 people',
  totalTime: '30 minutes',
  ingredients: [
    { amount: '100g', name: 'Flour' },
    { amount: '200ml', name: 'Water' }
  ],
  steps: [
    {
      instruction: 'Mix ingredients',
      duration: '5 min',
      speed: 'Speed 4',
      temperature: '100°C'
    }
  ]
}

describe('RecipeDisplay', () => {
  it('renders welcome placeholder when no recipe provided', () => {
    render(<RecipeDisplay recipe={null} />)

    expect(screen.getByText('Welcome to Recipe Genius')).toBeInTheDocument()
    expect(screen.getByText(/Generate a brand-new Thermomix recipe/)).toBeInTheDocument()
  })

  it('renders recipe details when recipe provided', () => {
    render(<RecipeDisplay recipe={mockRecipe} />)

    expect(screen.getByText('Test Recipe')).toBeInTheDocument()
    expect(screen.getByText('A delicious test recipe')).toBeInTheDocument()
    expect(screen.getByText('30 minutes')).toBeInTheDocument()
    expect(screen.getByText('4 people')).toBeInTheDocument()
  })

  it('renders ingredients list', () => {
    render(<RecipeDisplay recipe={mockRecipe} />)

    expect(screen.getByText('Ingredients')).toBeInTheDocument()
    expect(screen.getByText('100g')).toBeInTheDocument()
    expect(screen.getByText('Flour')).toBeInTheDocument()
    expect(screen.getByText('200ml')).toBeInTheDocument()
    expect(screen.getByText('Water')).toBeInTheDocument()
  })

  it('renders instructions with step details', () => {
    render(<RecipeDisplay recipe={mockRecipe} />)

    expect(screen.getByText('Instructions')).toBeInTheDocument()
    expect(screen.getByText('Mix ingredients')).toBeInTheDocument()
    expect(screen.getByText('Time:')).toBeInTheDocument()
    expect(screen.getByText('5 min')).toBeInTheDocument()
    expect(screen.getByText('Speed:')).toBeInTheDocument()
    expect(screen.getByText('Speed 4')).toBeInTheDocument()
    expect(screen.getByText('Temp:')).toBeInTheDocument()
    expect(screen.getByText('100°C')).toBeInTheDocument()
  })
})
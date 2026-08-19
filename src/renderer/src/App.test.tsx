import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the Timer with its Start button', () => {
    render(<App />)

    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument()
  })
})

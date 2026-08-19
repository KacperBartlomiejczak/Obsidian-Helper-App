import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders HELLO WORLD', () => {
    render(<App />)

    expect(screen.getByText('HELLO WORLD')).toBeInTheDocument()
  })
})

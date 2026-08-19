import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import Timer from './Timer'

describe('Timer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the formatted initial time', () => {
    render(<Timer initialSeconds={125} />)

    expect(screen.getByText('02:05')).toBeInTheDocument()
  })

  it('shows a Start button that is not counting down yet', () => {
    render(<Timer initialSeconds={10} />)

    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument()

    act(() => vi.advanceTimersByTime(3000))

    expect(screen.getByText('00:10')).toBeInTheDocument()
  })

  it('counts down every second once started and toggles to a Stop button', () => {
    render(<Timer initialSeconds={10} />)

    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    expect(screen.getByRole('button', { name: 'Stop' })).toBeInTheDocument()

    act(() => vi.advanceTimersByTime(1000))
    expect(screen.getByText('00:09')).toBeInTheDocument()

    act(() => vi.advanceTimersByTime(2000))
    expect(screen.getByText('00:07')).toBeInTheDocument()
  })

  it('pauses the countdown when Stop is clicked', () => {
    render(<Timer initialSeconds={10} />)

    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    act(() => vi.advanceTimersByTime(2000))
    expect(screen.getByText('00:08')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Stop' }))
    act(() => vi.advanceTimersByTime(3000))

    expect(screen.getByText('00:08')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument()
  })

  it('stops automatically and disables the button when it reaches zero', () => {
    render(<Timer initialSeconds={2} />)

    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    act(() => vi.advanceTimersByTime(2000))

    expect(screen.getByText('00:00')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Start' })).toBeDisabled()
  })
})

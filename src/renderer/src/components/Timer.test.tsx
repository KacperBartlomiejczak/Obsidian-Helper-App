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

  it('renders the formatted initial work time', () => {
    render(<Timer initialWorkMinutes={2} initialBreakMinutes={1} />)

    expect(screen.getByText('02:00')).toBeInTheDocument()
  })

  it('shows a Start button that is not counting down yet', () => {
    render(<Timer initialWorkMinutes={1} initialBreakMinutes={1} />)

    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument()

    act(() => vi.advanceTimersByTime(3000))

    expect(screen.getByText('01:00')).toBeInTheDocument()
  })

  it('counts down every second once started and toggles to a Stop button', () => {
    render(<Timer initialWorkMinutes={1} initialBreakMinutes={1} />)

    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    expect(screen.getByRole('button', { name: 'Stop' })).toBeInTheDocument()

    act(() => vi.advanceTimersByTime(1000))
    expect(screen.getByText('00:59')).toBeInTheDocument()

    act(() => vi.advanceTimersByTime(2000))
    expect(screen.getByText('00:57')).toBeInTheDocument()
  })

  it('pauses the countdown when Stop is clicked', () => {
    render(<Timer initialWorkMinutes={1} initialBreakMinutes={1} />)

    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    act(() => vi.advanceTimersByTime(2000))
    expect(screen.getByText('00:58')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Stop' }))
    act(() => vi.advanceTimersByTime(3000))

    expect(screen.getByText('00:58')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument()
  })

  it('keeps the duration inputs hidden until Edit is clicked', () => {
    render(<Timer initialWorkMinutes={25} initialBreakMinutes={5} />)

    expect(screen.queryByLabelText('Work (minutes)')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Break (minutes)')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))

    expect(screen.getByLabelText('Work (minutes)')).toBeInTheDocument()
    expect(screen.getByLabelText('Break (minutes)')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Done' }))

    expect(screen.queryByLabelText('Work (minutes)')).not.toBeInTheDocument()
  })

  it('lets you edit the work minutes while in edit mode and updates the displayed time', () => {
    render(<Timer initialWorkMinutes={25} initialBreakMinutes={5} />)

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
    fireEvent.change(screen.getByLabelText('Work (minutes)'), { target: { value: '10' } })

    expect(screen.getByText('10:00')).toBeInTheDocument()
  })

  it('lets you clear the work minutes field and type a new value', () => {
    render(<Timer initialWorkMinutes={25} initialBreakMinutes={5} />)

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))

    const workInput = screen.getByLabelText('Work (minutes)')
    fireEvent.change(workInput, { target: { value: '' } })

    expect(workInput).toHaveValue(null)
    expect(screen.getByText('25:00')).toBeInTheDocument()

    fireEvent.change(workInput, { target: { value: '15' } })

    expect(workInput).toHaveValue(15)
    expect(screen.getByText('15:00')).toBeInTheDocument()
  })

  it('shows a validation message and keeps the last valid duration when 0 is entered', () => {
    render(<Timer initialWorkMinutes={25} initialBreakMinutes={5} />)

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
    fireEvent.change(screen.getByLabelText('Work (minutes)'), { target: { value: '0' } })

    expect(screen.getByText('Time cannot be smaller than 1')).toBeInTheDocument()
    expect(screen.getByText('25:00')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Work (minutes)'), { target: { value: '12' } })

    expect(screen.queryByText('Time cannot be smaller than 1')).not.toBeInTheDocument()
    expect(screen.getByText('12:00')).toBeInTheDocument()
  })

  it('reverts an unfinished edit to the last valid value when Done is clicked', () => {
    render(<Timer initialWorkMinutes={25} initialBreakMinutes={5} />)

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
    fireEvent.change(screen.getByLabelText('Work (minutes)'), { target: { value: '0' } })
    fireEvent.click(screen.getByRole('button', { name: 'Done' }))

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))

    expect(screen.getByLabelText('Work (minutes)')).toHaveValue(25)
    expect(screen.queryByText('Time cannot be smaller than 1')).not.toBeInTheDocument()
  })

  it('disables the Edit button and hides the inputs once the timer is running', () => {
    render(<Timer initialWorkMinutes={1} initialBreakMinutes={1} />)

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
    fireEvent.click(screen.getByRole('button', { name: 'Start' }))

    expect(screen.getByRole('button', { name: 'Edit' })).toBeDisabled()
    expect(screen.queryByLabelText('Work (minutes)')).not.toBeInTheDocument()
  })

  it('switches to break, logs "Its time for break" and resets to the break duration when work ends', () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    render(<Timer initialWorkMinutes={1} initialBreakMinutes={2} />)

    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    act(() => vi.advanceTimersByTime(60_000))

    expect(consoleLogSpy).toHaveBeenCalledWith('Its time for break')
    expect(screen.getByText('02:00')).toBeInTheDocument()
    expect(screen.getByText('Break')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument()

    consoleLogSpy.mockRestore()
  })

  it('switches to work and logs "Get back to work" when break ends', () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    render(<Timer initialWorkMinutes={1} initialBreakMinutes={1} />)

    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    act(() => vi.advanceTimersByTime(60_000))
    expect(consoleLogSpy).toHaveBeenCalledWith('Its time for break')

    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    act(() => vi.advanceTimersByTime(60_000))

    expect(consoleLogSpy).toHaveBeenCalledWith('Get back to work')
    expect(screen.getByText('01:00')).toBeInTheDocument()
    expect(screen.getByText('Work')).toBeInTheDocument()

    consoleLogSpy.mockRestore()
  })
})

import { useEffect, useState } from 'react'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'

type TimerMode = 'work' | 'break'

interface TimerProps {
  initialWorkMinutes?: number
  initialBreakMinutes?: number
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function parsePositiveInteger(value: string): number | null {
  const parsed = Number(value)
  if (value.trim() === '' || !Number.isInteger(parsed) || parsed <= 0) {
    return null
  }
  return parsed
}

function Timer({
  initialWorkMinutes = 25,
  initialBreakMinutes = 5
}: TimerProps): React.JSX.Element {
  const [workMinutes, setWorkMinutes] = useState(initialWorkMinutes)
  const [breakMinutes, setBreakMinutes] = useState(initialBreakMinutes)
  const [mode, setMode] = useState<TimerMode>('work')
  const [secondsLeft, setSecondsLeft] = useState(initialWorkMinutes * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (!isRunning) return

    const intervalId = setInterval(() => {
      setSecondsLeft((current) => {
        if (current > 1) {
          return current - 1
        }

        const finishedMode = mode
        const nextMode: TimerMode = finishedMode === 'work' ? 'break' : 'work'

        console.log(finishedMode === 'work' ? 'Its time for break' : 'Get back to work')

        setMode(nextMode)
        setIsRunning(false)

        return nextMode === 'work' ? workMinutes * 60 : breakMinutes * 60
      })
    }, 1000)

    return () => clearInterval(intervalId)
  }, [isRunning, mode, workMinutes, breakMinutes])

  const handleWorkMinutesChange = (value: string): void => {
    const parsed = parsePositiveInteger(value)
    if (parsed === null) return

    setWorkMinutes(parsed)
    if (mode === 'work') {
      setSecondsLeft(parsed * 60)
    }
  }

  const handleBreakMinutesChange = (value: string): void => {
    const parsed = parsePositiveInteger(value)
    if (parsed === null) return

    setBreakMinutes(parsed)
    if (mode === 'break') {
      setSecondsLeft(parsed * 60)
    }
  }

  const handleToggleRunning = (): void => {
    if (!isRunning) {
      setIsEditing(false)
    }
    setIsRunning((current) => !current)
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <span className="text-muted-foreground text-sm font-medium uppercase tracking-wide">
        {mode === 'work' ? 'Work' : 'Break'}
      </span>

      <div className="h-16 overflow-hidden">
        <span
          key={secondsLeft}
          className="animate-slide-down block font-mono text-6xl font-bold tabular-nums"
        >
          {formatTime(secondsLeft)}
        </span>
      </div>

      <div className="flex gap-3">
        <Button onClick={handleToggleRunning} disabled={secondsLeft === 0}>
          {isRunning ? 'Stop' : 'Start'}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => setIsEditing((current) => !current)}
          disabled={isRunning}
        >
          {isEditing ? 'Done' : 'Edit'}
        </Button>
      </div>

      {isEditing && (
        <div className="flex gap-4">
          <label className="flex flex-col gap-1 text-sm">
            Work (minutes)
            <Input
              type="number"
              min={1}
              value={workMinutes}
              onChange={(event) => handleWorkMinutesChange(event.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Break (minutes)
            <Input
              type="number"
              min={1}
              value={breakMinutes}
              onChange={(event) => handleBreakMinutesChange(event.target.value)}
            />
          </label>
        </div>
      )}
    </div>
  )
}

export default Timer

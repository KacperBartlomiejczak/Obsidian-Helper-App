import { useEffect, useState } from 'react'
import { Button } from '@renderer/components/ui/button'

interface TimerProps {
  initialSeconds?: number
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function Timer({ initialSeconds = 300 }: TimerProps): React.JSX.Element {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    if (!isRunning) return

    const intervalId = setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          setIsRunning(false)
          return 0
        }
        return current - 1
      })
    }, 1000)

    return () => clearInterval(intervalId)
  }, [isRunning])

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="h-16 overflow-hidden">
        <span
          key={secondsLeft}
          className="animate-slide-down block font-mono text-6xl font-bold tabular-nums"
        >
          {formatTime(secondsLeft)}
        </span>
      </div>
      <Button onClick={() => setIsRunning((current) => !current)} disabled={secondsLeft === 0}>
        {isRunning ? 'Stop' : 'Start'}
      </Button>
    </div>
  )
}

export default Timer

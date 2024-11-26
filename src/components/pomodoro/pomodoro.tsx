import { Button, CircularProgress } from "@nextui-org/react"
import { PomodoroStateEnum, usePomodoroStore } from "../../states/pomodoro"
import { useEffect, useState } from "react"
import { LucideAlarmCheck, LucideAlarmClockMinus, LucideCirclePause, LucideCirclePlay, LucideTimerReset } from "lucide-react"

export const Pomodoro = () => {
  const { currentState, setCurrentState, focusTimeInMinutes, breakTimeInMinutes } = usePomodoroStore()

  const [seconds, setSeconds] = useState(focusTimeInMinutes * 60)
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout>()
  const [progressLabel, setProgressLabel] = useState("00:00:00")
  const audio = new Audio("/sounds/finish.mp3")

  const [pomodoroState, setPomodoroState] = useState({ isInitialLoad: true, isOnFocus: true, isOnBreak: false, canPause: false, isPaused: false })

  useEffect(() => {
    if (seconds <= 0) {
      setProgressLabel("00:00:00")
      clearInterval(intervalId)
      setIntervalId(undefined)
      setPomodoroState({ ...pomodoroState, isOnFocus: !pomodoroState.isOnFocus, isOnBreak: !pomodoroState.isOnBreak, canPause: false, isPaused: false })
      audio.play()
    }

    setProgressLabel(`${Math.floor(seconds / 3600).toString().padStart(2, "0")}:${Math.floor((seconds % 3600) / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`)
  }, [seconds])

  const handleFocusStart = () => {
    setSeconds(focusTimeInMinutes * 60)
    setPomodoroState({ isInitialLoad: false, isOnFocus: true, canPause: true, isOnBreak: false, isPaused: false })

    if (!intervalId) {
      const id = setInterval(() => {
        setSeconds((prev) => prev - 1)
      }, 1000)
  
      setIntervalId(id)
    }
  }

  const handleBreakStart = () => {
    setSeconds(breakTimeInMinutes * 60)
    setPomodoroState({ isInitialLoad: false, isOnFocus: false, canPause: true, isOnBreak: true, isPaused: false })

    if (!intervalId) {
      const id = setInterval(() => {
        setSeconds((prev) => prev - 1)
      }, 1000)
  
      setIntervalId(id)
    }
  }

  const handlePause = () => {
    if (pomodoroState.isPaused) {
      const id = setInterval(() => {
        setSeconds((prev) => prev - 1)
      }, 1000)
  
      setIntervalId(id)
      setPomodoroState({ ...pomodoroState, isPaused: false })
    } else {
      clearInterval(intervalId)
      setIntervalId(undefined)
      setPomodoroState({ ...pomodoroState, isPaused: true })
    }
  }

  const handleReset = () => {
    setSeconds(focusTimeInMinutes * 60)
    setCurrentState(PomodoroStateEnum.FOCUS)
    setPomodoroState({ ...pomodoroState, isOnFocus: true, canPause: true, isOnBreak: false, isPaused: false })
  }

  return (
    <div className="flex flex-row items-center justify-between p-4">
      <CircularProgress
        classNames={{
          svg: "w-36 h-36",
          indicator: pomodoroState.isOnFocus ? `stroke-primary` : `stroke-secondary`,
          track: pomodoroState.isOnFocus ? `stroke-primary/10` : `stroke-secondary/10`,
          value: "text-3xl font-semibold",
        }}
        aria-label="Pomodoro Timer"
        value={seconds}
        maxValue={currentState === PomodoroStateEnum.FOCUS ? focusTimeInMinutes * 60 : breakTimeInMinutes * 60}
        formatOptions={{ style: "decimal" }}
        label={progressLabel}
      />

      <div className="flex flex-col gap-2 w-32">
        {
          (!pomodoroState.isOnFocus || pomodoroState.isInitialLoad) && (
            <Button startContent={<LucideAlarmCheck size={18} />} size="sm" color="primary" onPress={handleFocusStart}>
              Focus
            </Button>
          )
        }
        {
          pomodoroState.canPause && (
            <>
              <Button startContent={pomodoroState.isPaused ? <LucideCirclePlay size={18} /> : <LucideCirclePause size={18} />} size="sm" onPress={handlePause}>
                {pomodoroState.isPaused ? "Resume" : "Pause"}
              </Button>
              <Button startContent={<LucideTimerReset size={18} />} size="sm" onPress={handleReset}>
                Reset
              </Button>
            </>
          )
        }
        {
          !pomodoroState.isOnBreak && (
            <Button startContent={<LucideAlarmClockMinus size={18} />} size="sm" color="secondary" onPress={handleBreakStart}>
              Break
            </Button>
          )
        }
      </div>
    </div>
  )
}
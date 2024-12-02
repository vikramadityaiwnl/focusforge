import { Button, CircularProgress } from "@nextui-org/react"
import { PomodoroStateEnum, usePomodoroStore } from "../../states/pomodoro"
import { useEffect, useState } from "react"
import { LucideAlarmCheck, LucideAlarmClockMinus, LucideCirclePause, LucideCirclePlay, LucideTimerReset } from "lucide-react"
import { useConfigureStore } from "../../states/configure"
import toast from "react-hot-toast"

export const Pomodoro = () => {
  const { currentState, setCurrentState } = usePomodoroStore()
  const { focusTimeInMinutes, breakTimeInMinutes } = useConfigureStore()

  const [seconds, setSeconds] = useState(focusTimeInMinutes * 60)
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout>()
  const [progressLabel, setProgressLabel] = useState("00:00:00")
  const finishAudio = new Audio("/sounds/finished.mp3")
  const startAudio = new Audio("/sounds/start.mp3")

  const [pomodoroState, setPomodoroState] = useState({ isInitialLoad: true, isOnFocus: true, isOnBreak: false, canPause: false, isPaused: false })

  useEffect(() => {
    setCurrentState(PomodoroStateEnum.FOCUS)
    setSeconds(focusTimeInMinutes * 60)
    setPomodoroState({ isInitialLoad: true, isOnFocus: true, isOnBreak: false, canPause: false, isPaused: false })
    clearInterval(intervalId)
    setIntervalId(undefined)
  }, [focusTimeInMinutes, breakTimeInMinutes])

  useEffect(() => {
    if (seconds <= 0) {
      setProgressLabel("00:00:00")
      clearInterval(intervalId)
      setIntervalId(undefined)
      setPomodoroState({ isInitialLoad: true, isOnFocus: true, isOnBreak: false, canPause: false, isPaused: false })
      finishAudio.play()
    }

    setProgressLabel(`${Math.floor(seconds / 3600).toString().padStart(2, "0")}:${Math.floor((seconds % 3600) / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`)
  }, [seconds])

  const handleFocusStart = () => {
    setCurrentState(PomodoroStateEnum.FOCUS)
    setSeconds(focusTimeInMinutes * 60)
    toast.success("Focus time! 🚀 Let's get some work done! 💪")
    startAudio.play()
    setPomodoroState({ isInitialLoad: false, isOnFocus: true, canPause: true, isOnBreak: false, isPaused: false })

    if (!intervalId) {
      const id = setInterval(() => {
        setSeconds((prev) => prev - 1)
      }, 1000)
  
      setIntervalId(id)
    }
  }

  const handleBreakStart = () => {
    setCurrentState(PomodoroStateEnum.BREAK)
    setSeconds(breakTimeInMinutes * 60)
    toast.success("Break time! 🎉 Take a breather and touch some grass 🌿")
    startAudio.play()
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
    setCurrentState(PomodoroStateEnum.FOCUS)
    setSeconds(focusTimeInMinutes * 60)
    clearInterval(intervalId)
    setIntervalId(undefined)
    setPomodoroState({ isInitialLoad: true, isOnFocus: true, isOnBreak: false, canPause: false, isPaused: false })
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
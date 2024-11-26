import { create } from "zustand"

export enum PomodoroStateEnum {
  FOCUS = "FOCUS",
  BREAK = "BREAK",
  NULL = "NULL",
}

type PomodoroStore = {
  currentState: PomodoroStateEnum,
  setCurrentState: (state: PomodoroStateEnum) => void,
  focusTimeInMinutes: number,
  setFocusTimeInMinutes: (time: number) => void,
  breakTimeInMinutes: number,
  setBreakTimeInMinutes: (time: number) => void,
}

export const usePomodoroStore = create<PomodoroStore>((set) => ({
  currentState: PomodoroStateEnum.NULL,
  setCurrentState: (state) => set({ currentState: state }),
  focusTimeInMinutes: 1,
  setFocusTimeInMinutes: (time) => set({ focusTimeInMinutes: time }),
  breakTimeInMinutes: 1,
  setBreakTimeInMinutes: (time) => set({ breakTimeInMinutes: time }),
}))
import { create } from "zustand"

export enum PomodoroStateEnum {
  FOCUS = "FOCUS",
  BREAK = "BREAK",
  NULL = "NULL",
}

type PomodoroStore = {
  currentState: PomodoroStateEnum,
  setCurrentState: (state: PomodoroStateEnum) => void,
}

export const usePomodoroStore = create<PomodoroStore>((set) => ({
  currentState: PomodoroStateEnum.NULL,
  setCurrentState: (state) => set({ currentState: state }),
}))
import { create } from "zustand";

type ConfigureStore = {
  showPomodoroClock: boolean,
  setShowPomodoroClock: (show: boolean) => void,

  focusTimeInMinutes: number,
  setFocusTimeInMinutes: (minutes: number) => void,

  breakTimeInMinutes: number,
  setBreakTimeInMinutes: (minutes: number) => void,

  aiWebsiteBlockerEnabled: boolean,
  setAiWebsiteBlockerEnabled: (enabled: boolean) => void,
}

export const useConfigureStore = create<ConfigureStore>((set) => {
  const savedConfig = localStorage.getItem('configuration');
  const initialState = savedConfig ? JSON.parse(savedConfig) : {
    showPomodoroClock: true,
    focusTimeInMinutes: 25,
    breakTimeInMinutes: 5,
    aiWebsiteBlockerEnabled: true,
  };

  return {
    ...initialState,
    setShowPomodoroClock: (show) => set((state) => {
      const newState = { ...state, showPomodoroClock: show };
      localStorage.setItem('configuration', JSON.stringify(newState));
      return newState;
    }),

    setFocusTimeInMinutes: (minutes) => set((state) => {
      const newState = { ...state, focusTimeInMinutes: minutes };
      localStorage.setItem('configuration', JSON.stringify(newState));
      return newState;
    }),

    setBreakTimeInMinutes: (minutes) => set((state) => {
      const newState = { ...state, breakTimeInMinutes: minutes };
      localStorage.setItem('configuration', JSON.stringify(newState));
      return newState;
    }),

    setAiWebsiteBlockerEnabled: (enabled) => set((state) => {
      const newState = { ...state, aiWebsiteBlockerEnabled: enabled };
      localStorage.setItem('configuration', JSON.stringify(newState));
      return newState;
    }),
  };
});
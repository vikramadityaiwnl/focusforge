import { create } from "zustand";

type ConfigureStore = {
  showPomodoroClock: boolean,
  setShowPomodoroClock: (show: boolean) => void,

  focusTimeInMinutes: number,
  setFocusTimeInMinutes: (minutes: number) => void,

  breakTimeInMinutes: number,
  setBreakTimeInMinutes: (minutes: number) => void,

  strictAIWebsiteBlockerEnabled: boolean,
  setStrictAIWebsiteBlockerEnabled: (enabled: boolean) => void,

  showTodo: boolean,
  setShowTodo: (show: boolean) => void,

  showTabs: boolean,
  setShowTabs: (show: boolean) => void,

  showChat: boolean,
  setShowChat: (show: boolean) => void,

  showClipboard: boolean,
  setShowClipboard: (show: boolean) => void,
}

export const useConfigureStore = create<ConfigureStore>((set) => {
  const savedConfig = localStorage.getItem('configuration');
  const initialState = savedConfig ? JSON.parse(savedConfig) : {
    showPomodoroClock: true,
    focusTimeInMinutes: 25,
    breakTimeInMinutes: 5,
    strictAIWebsiteBlockerEnabled: true,
    showTodo: true,
    showTabs: true,
    showChat: true,
    showClipboard: true,
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

    setStrictAIWebsiteBlockerEnabled: (enabled) => set((state) => {
      const newState = { ...state, aiWebsiteBlockerEnabled: enabled };
      localStorage.setItem('configuration', JSON.stringify(newState));
      return newState;
    }),

    setShowTodo: (show) => set((state) => {
      const newState = { ...state, showTodo: show };
      localStorage.setItem('configuration', JSON.stringify(newState));
      return newState;
    }),

    setShowTabs: (show) => set((state) => {
      const newState = { ...state, showTabs: show };
      localStorage.setItem('configuration', JSON.stringify(newState));
      return newState;
    }),

    setShowChat: (show) => set((state) => {
      const newState = { ...state, showChat: show };
      localStorage.setItem('configuration', JSON.stringify(newState));
      return newState;
    }),

    setShowClipboard: (show) => set((state) => {
      const newState = { ...state, showClipboard: show };
      localStorage.setItem('configuration', JSON.stringify(newState));
      return newState;
    }),
  };
});
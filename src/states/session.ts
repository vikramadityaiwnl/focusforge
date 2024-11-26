import { create } from "zustand";

export interface Session {
  id: string,
  name: string,
  createdOn: string,
  totalTasks: number,
  todos: Todo[],
  pomodoro: {
    focusTimeInMinutes: number,
    breakTimeInMinutes: number,
  }
}

export interface Todo {
  id: string,
  name: string,
  completed: boolean,
}

type SessionStore = {
  sessions: Session[],
  addSession: (session: Session) => void,
  removeSession: (id: string) => void,
  updateSession: (id: string, session: Session) => void,
}

const getSessions = () => {
  if (!localStorage.getItem("sessions")) {
    localStorage.setItem("sessions", JSON.stringify([]))
  }

  return JSON.parse(localStorage.getItem("sessions") || "[]") as Session[]
}

const saveSession = (sessions: Session[]) => {
  localStorage.setItem("sessions", JSON.stringify(sessions))
}

export const useSessionStore = create<SessionStore>((set) => ({
  sessions: getSessions(),

  addSession: (session: Session) => set((state) => {
    const newList = [...state.sessions, session];
    saveSession(newList);
    return { sessions: newList };
  }),

  removeSession: (id: string) => set((state) => {
    const newList = state.sessions.filter((session) => session.id !== id);
    saveSession(newList);
    return { sessions: newList };
  }),

  updateSession: (id: string, newSession: Session) => set((state) => {
    const newList = state.sessions.map((session) => 
      session.id === id ? newSession : session
    );
    saveSession(newList);
    return { sessions: newList };
  }),
}))
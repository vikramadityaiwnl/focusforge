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
  currentSession: Session | null,
  addSession: (session: Session) => void,
  removeSession: (id: string) => void,
  updateSession: (id: string, session: Session) => void,
  setCurrentSession: (session: Session) => void,
  addTodo: (todo: Todo) => void,
  removeTodo: (id: string) => void,
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
  currentSession: null,

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

  setCurrentSession: (session: Session) => set({ currentSession: session }),

  addTodo: (todo: Todo) => set((state) => {
    if (!state.currentSession) return {};
    const newList = state.currentSession.todos.concat(todo);
    const newSession = { ...state.currentSession, todos: newList } as Session;
    const newSessions = state.sessions.map((session) => 
      session.id === state.currentSession?.id ? newSession : session
    );
    saveSession(newSessions);
    return { sessions: newSessions, currentSession: newSession };
  }),

  removeTodo: (id: string) => set((state) => {
    if (!state.currentSession) return {};
    const newList = state.currentSession.todos.filter((todo) => todo.id !== id);
    const newSession = { ...state.currentSession, todos: newList } as Session;
    const newSessions = state.sessions.map((session) => 
      session.id === state.currentSession?.id ? newSession : session
    );
    saveSession(newSessions);
    return { sessions: newSessions, currentSession: newSession };
  }),
}))
import { create } from "zustand";
import { Conversation } from "./conversation";

export interface Session {
  id: string,
  name: string,
  createdOn: string,
  totalTasks: number,
  todos: Todo[],
  conversation: Conversation[],
  clipboard: any[],
}

export interface Todo {
  id: string,
  name: string,
  completed: boolean,
}

type SessionStore = {
  sessions: Session[],
  currentSession: Session | null,
  todoInsights: string,
  clipboard: any[],
  addToClipboard: (clipboard: any) => void,
  removeFromClipboard: (index: number) => void,
  setTodos: (todos: Todo[]) => void,
  addSession: (session: Session) => void,
  removeSession: (id: string) => void,
  updateSession: (id: string, session: Session) => void,
  setCurrentSession: (session: Session) => void,
  addTodo: (todo: Todo) => void,
  removeTodo: (id: string) => void,
  updateTodo: (id: string, todo: Todo) => void,
  setTodoInsights: (insights: string) => void,
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
  clipboard: [],

  setTodos: (todos: Todo[]) => set((state) => {
    if (!state.currentSession) return {};
    const newSession = { 
      ...state.currentSession, 
      todos,
      totalTasks: todos.length 
    } as Session;
    const newSessions = state.sessions.map((session) => 
      session.id === state.currentSession?.id ? newSession : session
    );
    saveSession(newSessions);
    return { sessions: newSessions, currentSession: newSession };
  }),

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

  setCurrentSession: (session: Session) => set({ 
    currentSession: session,
    clipboard: session.clipboard || [] 
  }),

  addTodo: (todo: Todo) => set((state) => {
    if (!state.currentSession) return {};
    const newList = state.currentSession.todos.concat(todo);
    const newSession = { 
      ...state.currentSession, 
      todos: newList,
      totalTasks: newList.length 
    } as Session;
    const newSessions = state.sessions.map((session) => 
      session.id === state.currentSession?.id ? newSession : session
    );
    saveSession(newSessions);
    return { sessions: newSessions, currentSession: newSession };
  }),

  removeTodo: (id: string) => set((state) => {
    if (!state.currentSession) return {};
    const newList = state.currentSession.todos.filter((todo) => todo.id !== id);
    const newSession = { 
      ...state.currentSession, 
      todos: newList,
      totalTasks: newList.length 
    } as Session;
    const newSessions = state.sessions.map((session) => 
      session.id === state.currentSession?.id ? newSession : session
    );
    saveSession(newSessions);
    return { sessions: newSessions, currentSession: newSession };
  }),

  updateTodo: (id: string, newTodo: Todo) => set((state) => {
    if (!state.currentSession) return {};
    const newList = state.currentSession.todos.map((todo) => 
      todo.id === id ? newTodo : todo
    );
    const newSession = { 
      ...state.currentSession, 
      todos: newList,
      totalTasks: newList.length 
    } as Session;
    const newSessions = state.sessions.map((session) => 
      session.id === state.currentSession?.id ? newSession : session
    );
    saveSession(newSessions);
    return { sessions: newSessions, currentSession: newSession };
  }),

  addToClipboard: (newItem: any) => set((state) => {
    if (!state.currentSession) return { clipboard: [] };
    const newClipboard = [...state.clipboard, newItem];
    const newSession = { 
      ...state.currentSession, 
      clipboard: newClipboard 
    } as Session;
    const newSessions = state.sessions.map((session) => 
      session.id === state.currentSession?.id ? newSession : session
    );
    saveSession(newSessions);
    return { 
      clipboard: newClipboard,
      sessions: newSessions,
      currentSession: newSession
    };
  }),

  removeFromClipboard: (index: number) => set((state) => {
    if (!state.currentSession) return { clipboard: [] };
    const newClipboard = state.clipboard.filter((_, i) => i !== index);
    const newSession = { 
      ...state.currentSession, 
      clipboard: newClipboard 
    } as Session;
    const newSessions = state.sessions.map((session) => 
      session.id === state.currentSession?.id ? newSession : session
    );
    saveSession(newSessions);
    return { 
      clipboard: newClipboard,
      sessions: newSessions,
      currentSession: newSession
    };
  }),

  todoInsights: "",
  setTodoInsights: (insights: string) => set({ todoInsights: insights }),
}))
import { create } from "zustand";

export interface SessionList {
  id: string,
  name: string,
  createdOn: string,
  totalTasks: number,
}

type SessionStore = {
  sessionList: SessionList[],
  addSessionList: (session: SessionList) => void,
  removeSessionList: (id: string) => void,
  updateSessionList: (id: string, session: SessionList) => void,
}

const getSessionList = () => {
  if (!localStorage.getItem("session-list")) {
    localStorage.setItem("session-list", JSON.stringify([]))
  }

  return JSON.parse(localStorage.getItem("session-list") || "[]") as SessionList[]
}

const saveSessionList = (sessionList: SessionList[]) => {
  localStorage.setItem("session-list", JSON.stringify(sessionList))
}

export const useSessionStore = create<SessionStore>((set) => ({
  sessionList: getSessionList(),

  addSessionList: (session: SessionList) => set((state) => {
    const newList = [...state.sessionList, session];
    saveSessionList(newList);
    return { sessionList: newList };
  }),

  removeSessionList: (id: string) => set((state) => {
    const newList = state.sessionList.filter((session) => session.id !== id);
    saveSessionList(newList);
    return { sessionList: newList };
  }),

  updateSessionList: (id: string, newSession: SessionList) => set((state) => {
    const newList = state.sessionList.map((session) => 
      session.id === id ? newSession : session
    );
    saveSessionList(newList);
    return { sessionList: newList };
  }),
}))
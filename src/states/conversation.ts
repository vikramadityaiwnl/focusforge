import { create } from "zustand"
import { Session } from "./session"

export interface Conversation {
  type: "user" | "bot",
  text: string,
  attachments?: any,
  isThinking?: boolean,
}

type ConversationStore = {
  sessionId: string,
  conversation: Conversation[],
  setSessionConversation: () => void,
  setSessionId: (sessionId: string) => void,
  addUserMessage: (text: string, attachments?: any) => void,
  addBotMessage: (text: string, isThinking?: boolean) => void,
  removeThinkingMessage: () => void,
  clearMessages: () => void,
}

const getSessions = () => {
  return JSON.parse(localStorage.getItem("sessions") || "[]") as Session[]
}

const saveConversation = (sessionId: string, conversation: Conversation[]) => {
  const sessions = getSessions()
  const newSessions = sessions.map(session => 
    session.id === sessionId 
      ? { ...session, conversation }
      : session
  )
  localStorage.setItem("sessions", JSON.stringify(newSessions))
}

export const useConversationStore = create<ConversationStore>((set) => ({
  sessionId: "",
  conversation: [],

  setSessionId: (sessionId: string) => set({ sessionId }),

  setSessionConversation: () => set((state) => {
    const sessions = getSessions();
    const currentSession = sessions.find(session => session.id === state.sessionId);
    return { conversation: currentSession?.conversation || [] };
  }),

  addUserMessage: (text: string, attachments?: any) => set((state) => {
    const newConversation: Conversation[] = [...state.conversation, { type: "user", text, attachments }]
    if (state.sessionId) {
      saveConversation(state.sessionId, newConversation)
    }
    return { conversation: newConversation }
  }),

  addBotMessage: (text: string, isThinking?: boolean) => set((state) => {
    const newConversation: Conversation[] = [...state.conversation, { type: "bot", text, isThinking }]
    if (state.sessionId && !isThinking) {
      saveConversation(state.sessionId, newConversation)
    }
    return { conversation: newConversation }
  }),

  removeThinkingMessage: () => set((state) => {
    const newConversation = state.conversation.filter((message) => !message.isThinking)
    if (state.sessionId) {
      saveConversation(state.sessionId, newConversation)
    }
    return { conversation: newConversation }
  }),

  clearMessages: () => set((state) => {
    if (state.sessionId) {
      saveConversation(state.sessionId, [])
    }
    return { conversation: [] }
  }),
}))
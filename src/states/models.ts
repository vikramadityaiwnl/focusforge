import toast from "react-hot-toast";
import { create } from "zustand";

type AIModels = {
  chatModel: AILanguageModel | null,
  setChatModel: (model: AILanguageModel) => void,

  summarizeModel: AISummarizerModel | null,
  setSummarizeModel: (model: AISummarizerModel) => void,

  magicModel: AILanguageModel | null,
  setMagicModel: (model: AILanguageModel) => void,
}

export const useAIModelsStore = create<AIModels>((set) => ({
  chatModel: null,
  setChatModel: (model) => set({ chatModel: model }),

  summarizeModel: null,
  setSummarizeModel: (model) => set({ summarizeModel: model }),

  magicModel: null,
  setMagicModel: (model) => set({ magicModel: model }),
}))

export const initializeAIModels = async () => {
  if (!self.ai) {
    toast.error("AI not available.")
    return
  }

  try {
    const chatCapabilitiesPromise = self.ai.languageModel.capabilities()
    const summarizingCapabilitiesPromise = self.ai.summarizer.capabilities()
    const magicCapabilitiesPromise = self.ai.languageModel.capabilities()
    
    toast.promise(Promise.all([chatCapabilitiesPromise, summarizingCapabilitiesPromise, magicCapabilitiesPromise]), {
      loading: 'Initializing...',
      success: 'Initialized!',
      error: 'Failed to initialize!',
    })

    const [chatCapabilities, summarizingCapabilities, magicCapabilities] = 
      await Promise.all([chatCapabilitiesPromise, summarizingCapabilitiesPromise, magicCapabilitiesPromise])
  
    if (chatCapabilities.available === "no" || summarizingCapabilities.available === "no" || magicCapabilities.available === "no") return
  
    const chatSystemPrompt = "You are an AI assistant integrated into FocusForge, a productivity tool designed to help users manage and optimize their working sessions. Your role is to provide insightful, concise, and actionable advice to help users stay focused, manage their time effectively, and achieve their goals. You should be supportive, encouraging, and resourceful, offering tips on task management, time blocking, and maintaining a healthy work-life balance. Always strive to enhance the user's productivity and well-being."
    const magicSystemPrompt = `You are a productivity AI assistant. For any todo list, provide a JSON object in this exact format:
      {
        "insights": "Breif insights about the todos (include key dependencies, time estimates, core patterns, etc.)",
        "todos": [
          {
          "id": number,
          "name": string,
          "completed": boolean
          }
        ]
      }

      Rules:
      - Return only the JSON object, nothing else
      - Insights should be in proper markdown format
      - Order todos by priority (highest first)
      - Focus on essential steps
      - Make sure insights are for all todos, not just the one todo or completed ones
      - Dont include retry attempts in insights
    `

    const [chatModel, summarizeModel, magicModel] = await Promise.all([
      self.ai.languageModel.create({ systemPrompt: chatSystemPrompt }),
      self.ai.summarizer.create(),
      self.ai.languageModel.create({ systemPrompt: magicSystemPrompt })
    ])
  
    const store = useAIModelsStore.getState()
    store.setChatModel(chatModel)
    store.setSummarizeModel(summarizeModel)
    store.setMagicModel(magicModel)
  } catch (error) {
    toast.error(String(error))
  }
}

export const reInitializeSummaryModel = async () => {
  const { summarizeModel } = useAIModelsStore.getState()
  if (!summarizeModel) return

  try {
    summarizeModel.destroy()
    const newSummarizeModel = await self.ai.summarizer.create()
    useAIModelsStore.getState().setSummarizeModel(newSummarizeModel)
  } catch (error) {
    toast.error(String(error))
  }
}

export const shouldBlockWebsite = async (url: string, title: string, content: string, sessionName: string) => {
  if (!self.ai) {
    toast.error("AI not available.")
    return false
  }

  const blockerModel = await self.ai.languageModel.create({
    systemPrompt: `You are a website blocker AI assistant. Given a website's URL, title, and content, determine if it should be blocked during work sessions. Response format: Return a JSON object with a single "block" boolean property. Example: {"block": true} for distracting/non-work-related sites, or {"block": false} for work-related/educational sites that match the session '${sessionName}'. Do not include any other text or explanation in your response.`,
  })

  try {
    const response = await blockerModel.prompt(JSON.stringify({ url, title, content, sessionName }))
    const result = JSON.parse(response)
    return result.block
  } catch (error) {
    toast.error(String(error))
    return false
  } finally {
    blockerModel.destroy()
  }
}
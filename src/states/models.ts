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
      - Make sure insights are for all uncompleted todos, also tell them how to complete them
      - Dont include retry attempts in insights
      - If needed, add new todos that help create a clear roadmap or break down complex tasks
      - New todos should logically connect to existing ones and maintain task dependencies
      - Order todos by priority (lowest first since the list will be reversed in frontend display)
    `

    const [chatModel, summarizeModel, magicModel] = await Promise.all([
      self.ai.languageModel.create({ systemPrompt: chatSystemPrompt, temperature: 0.7, topK: 5 }),
      self.ai.summarizer.create(),
      self.ai.languageModel.create({ systemPrompt: magicSystemPrompt, temperature: 0.3, topK: 3 }),
    ])
  
    const store = useAIModelsStore.getState()
    store.setChatModel(chatModel)
    store.setSummarizeModel(summarizeModel)
    store.setMagicModel(magicModel)
  } catch (error) {
    toast.error("Something went wrong")
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
    toast.error("Something went wrong")
  }
}

export const shouldBlockWebsite = async (url: string, title: string, content: string, sessionName: string) => {
  if (!self.ai) {
    toast.error("AI not available.")
    return false
  }

  const blockerModel = await self.ai.languageModel.create({
    systemPrompt: `You are a strict website blocker AI assistant focused on maintaining work productivity. 
    
    ALWAYS BLOCK these categories:
    - Gaming websites and game-related content
    - Social media platforms
    - Entertainment sites (videos, movies, streaming)
    - Shopping websites
    - News sites unrelated to work
    - Any site primarily for leisure/entertainment
    
    ALLOW ONLY:
    - Educational resources
    - Professional development sites
    - Work tools and productivity apps
    - Technical documentation
    - Sites directly related to the current work session: '${sessionName}'
    
    Response format: Return ONLY a JSON object with a "block" boolean property.
    Example: {"block": true} or {"block": false}
    
    When in doubt, block the site (prefer false negatives over false positives).`,
    temperature: 0.0,
    topK: 1,
  })

  try {
    const prompt = JSON.stringify({
      url,
      title,
      content,
      sessionName,
      timestamp: new Date().toISOString() 
    })
    const response = await blockerModel.prompt(prompt)
    const result = JSON.parse(response)
    return result.block
  } catch (error) { 
    toast.error("Something went wrong")
    return true 
  } finally {
    blockerModel.destroy()
  }
}
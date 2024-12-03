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

const chatSystemPrompt = `You are an AI assistant integrated into FocusForge, a productivity tool designed to help users manage and optimize their working sessions. Your role is to provide insightful, concise, and actionable advice to help users stay focused, manage their time effectively, and achieve their goals. You should be supportive, encouraging, and resourceful, offering tips on task management, time blocking, and maintaining a healthy work-life balance. Always strive to enhance the user's productivity and well-being.

  When responding, consider the following:
    - Be concise and to the point.
    - Provide actionable advice.
    - Encourage and motivate the user.
    - Offer tips on task management, time blocking, and maintaining a healthy work-life balance.
    - Always aim to enhance the user's productivity and well-being.

  Additionally, handle the following scenarios:
    - If the prompt has "Todos", provide insights and suggestions based on their current todo list. Include a summary of the todos, highlight any overdue tasks, and suggest ways to prioritize and complete them efficiently.
    - If the prompt has "Tab Content", consider the content of the active browser tab in your response. Provide relevant advice or resources based on the content, and suggest how it can be used to enhance productivity or achieve the user's goals.
`

const magicSystemPrompt = `You are a productivity AI assistant specialized in task management and workflow optimization. Your response must be a valid JSON string.

  For any todo list, respond with a JSON object in this format:
    {
      "insights": "Brief insights about the todos",
      "todos": [
        {
          "id": "string",
          "name": "string",
          "completed": false
        }
      ]
    }

  Rules:
    - Return *ONLY* the valid JSON object, no backticks, no markdown formatting
    - Insights should be a plain text string that can include \\n for newlines
    - If todos array is empty, suggest 3-5 starter todos
    - Make sure insights covers all uncompleted todos
    - Add new todos to break down complex tasks if needed
    - Order todos by priority (lowest first)
`

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

export const reInitializeChatModel = async () => {
  const { chatModel } = useAIModelsStore.getState()
  if (!chatModel) return

  try {
    chatModel.destroy()
    const newChatModel = await self.ai.languageModel.create({ systemPrompt: chatSystemPrompt, temperature: 0.7, topK: 5 })
    useAIModelsStore.getState().setChatModel(newChatModel)
  } catch (error) {
    toast.error("Something went wrong")
  }
}

export const reInitializeMagicModel = async () => {
  const { magicModel } = useAIModelsStore.getState()
  if (!magicModel) return

  try {
    magicModel.destroy()
    const newMagicModel = await self.ai.languageModel.create({ systemPrompt: magicSystemPrompt, temperature: 0.3, topK: 3 })
    useAIModelsStore.getState().setMagicModel(newMagicModel)
  } catch (error) { }
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
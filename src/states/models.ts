import toast from "react-hot-toast";
import { create } from "zustand";

type AIModels = {
  chatModel: AILanguageModel | null,
  setChatModel: (model: AILanguageModel) => void,

  summarizeModel: AISummarizerModel | null,
  setSummarizeModel: (model: AISummarizerModel) => void,
}

export const useAIModelsStore = create<AIModels>((set) => ({
  chatModel: null,
  setChatModel: (model) => set({ chatModel: model }),

  summarizeModel: null,
  setSummarizeModel: (model) => set({ summarizeModel: model }),
}))

export const initializeAIModels = async () => {
  if (!self.ai) {
    toast.error("AI not available.")
    return
  }

  try {
    const chatCapabilitiesPromise = self.ai.languageModel.capabilities()
    const summarizingCapabilitiesPromise = self.ai.summarizer.capabilities()
    toast.promise(Promise.all([chatCapabilitiesPromise, summarizingCapabilitiesPromise]), {
      loading: 'Initializing...',
      success: 'Initialized!',
      error: 'Failed to initialize!',
    })

    const [chatCapabilities, summarizingCapabilities] = await Promise.all([chatCapabilitiesPromise, summarizingCapabilitiesPromise])
  
    if (chatCapabilities.available === "no" || summarizingCapabilities.available === "no") return
  
    const systemPrompt = "You are an AI assistant integrated into FocusForge, a productivity tool designed to help users manage and optimize their working sessions. Your role is to provide insightful, concise, and actionable advice to help users stay focused, manage their time effectively, and achieve their goals. You should be supportive, encouraging, and resourceful, offering tips on task management, time blocking, and maintaining a healthy work-life balance. Always strive to enhance the user's productivity and well-being."
    const chatModel = await self.ai.languageModel.create({ systemPrompt })
    const summarizeModel = await self.ai.summarizer.create()
  
    useAIModelsStore.getState().setChatModel(chatModel)
    useAIModelsStore.getState().setSummarizeModel(summarizeModel)
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
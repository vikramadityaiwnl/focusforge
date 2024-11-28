import { Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/home';
import { SessionPage } from './pages/session';
import { useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useTheme } from 'next-themes';
import { useAIModelsStore } from './states/models';

function App() {
  const { theme } = useTheme()
  const { setChatModel, setSummarizeModel } = useAIModelsStore()

  useEffect(() => {
    initializeAIModels()
  }, [])

  const initializeAIModels = async () => {
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
    
      setChatModel(chatModel)
      setSummarizeModel(summarizeModel)
    } catch (error) {
      toast.error(String(error))
    }
  }

  return (
    <>
      <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/:sessionId" element={<SessionPage />} />
      </Routes>

      <Toaster 
        position='top-right' 
        containerClassName='mt-14 text-sm' 
        toastOptions={{
          style: {
            background: theme === "dark" ? '#333' : '#fff',
            color: theme === "dark" ? '#fff' : '#333',
          },
        }}
      />
    </>
  )
}

export default App

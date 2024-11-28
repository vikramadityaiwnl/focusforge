import { Button, Input } from "@nextui-org/react"
import { LucideBot, LucidePaperclip, LucideSend, LucideUser2 } from "lucide-react"
import { useConversationStore } from "../../states/conversation"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { useAIModelsStore } from "../../states/models"
import Markdown from "react-markdown"
import { useSessionStore } from "../../states/session"

export const AI = () => {
  const { conversation, setSessionConversation, addUserMessage, addBotMessage, removeThinkingMessage } = useConversationStore()
  const { chatModel } = useAIModelsStore()
  const { currentSession } = useSessionStore()

  const [inputText, setInputText] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (currentSession) setSessionConversation()
  }, [])

  const handleConversation = async () => {
    if (!inputText) return
    if (inputText.trim() === "") return
    if (inputText.length > 1000) {
      toast.error("Message too long.")
      return
    }
    if (!chatModel) {
      toast.error("AI not available.")
      return
    }

    setIsLoading(true)

    addUserMessage(inputText)
    addBotMessage("Thinking...", true)

    const response = await chatModel.prompt(inputText)
    removeThinkingMessage()
    addBotMessage(response)
    
    setIsLoading(false)
    setInputText("")
  }

  return (
    <div className="flex flex-col w-full h-full">
      <div className="chat-card mb-4 rounded shadow-sm flex-grow overflow-y-auto p-2">
        {conversation.map((message, index) => (
          <div key={index} className={`message ${message.type === "user" ? "text-right" : "text-left"} mb-2 flex ${message.type === "user" ? "justify-end" : "justify-start"} items-start`}>
            {message.type === "bot" && <LucideBot size={18} className="mr-2 flex-shrink-0" />}
            <Markdown className={`message-bubble ${message.type === "user" ? "bg-primary text-white" : "bg-default-100 text-default-900"} p-2 rounded text-sm`}>
              {message.text}
            </Markdown>
            {message.type === "user" && <LucideUser2 size={18} className="ml-2 flex-shrink-0" />}
          </div>
        ))}
      </div>

      <Input
        placeholder="Enter text"
        value={inputText}
        isDisabled={isLoading}
        onChange={(e) => setInputText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleConversation()}
        startContent={
          <LucidePaperclip size={18} className="cursor-pointer" onClick={() => null} />
        }
        endContent={
          isLoading ? (
            <Button isIconOnly variant="flat" size="sm" isLoading spinner={
              <svg
                className="animate-spin h-5 w-5 text-current"
                fill="none"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4" />
                  <path
                    className="opacity-75"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    fill="currentColor" />
              </svg>
            } />
          ) : (
            <Button isIconOnly variant="flat" size="sm" onPress={handleConversation}>
              <LucideSend size={18} />
            </Button>
          )
        }
        className="flex-shrink-0 mb-2"
      />

      <p className="text-xs text-neutral-500 text-center">AI responses may not be accurate.</p>
    </div>
  )
}

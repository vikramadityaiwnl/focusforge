import { Button, Input } from "@nextui-org/react"
import { LucideBot, LucideSend, LucideUser2 } from "lucide-react"
import { useConversationStore } from "../../states/conversation"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { useAIModelsStore } from "../../states/models"
import Markdown from "react-markdown"
import { useSessionStore } from "../../states/session"
import { Spinner } from "../spinner/spinner"

export const Chat = () => {
  const { conversation, setSessionConversation, addUserMessage, addBotMessage, removeThinkingMessage } = useConversationStore()
  const { chatModel } = useAIModelsStore()
  const { currentSession } = useSessionStore()

  const [inputText, setInputText] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (currentSession) setSessionConversation()
  }, [])

  const handleConversation = async () => {
    try {
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

      let finalPrompt = inputText;

      if (inputText.includes("/todo") && currentSession?.todos) {
        finalPrompt = `Todos: ${JSON.stringify(currentSession.todos)}\n\nUser Message: ${finalPrompt}`;
      }

      addUserMessage(inputText)
      addBotMessage("Thinking...", true)

      const stream: any = chatModel.promptStreaming(finalPrompt)
      let fullResponse = ""
      
      for await (const chunk of stream) {
        const newText = chunk.replace(fullResponse, "")
        fullResponse += newText
        removeThinkingMessage()
        addBotMessage(fullResponse, true)
      }
      removeThinkingMessage()
      addBotMessage(fullResponse)
      
      setInputText("")
    } catch (error) {
      toast.error("An error occurred while processing your request.")
      removeThinkingMessage()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col w-full h-full">
      <div className="chat-card rounded shadow-sm flex-grow overflow-y-auto p-2">
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

      <div className="mt-2">
        <Input
          placeholder="Enter text"
          value={inputText}
          isDisabled={isLoading}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleConversation()}
          endContent={
            isLoading ? (
              <Button isIconOnly variant="flat" size="sm" isLoading spinner={<Spinner />} />
            ) : (
              <Button isIconOnly variant="flat" size="sm" onPress={handleConversation}>
                <LucideSend size={18} />
              </Button>
            )
          }
          className="flex-shrink-0 mb-2"
        />
      </div>

      <p className="text-xs flex-shrink-0 text-neutral-500 text-center">AI responses may be limited in accuracy and context awareness. Use with discretion.</p>
    </div>
  )
}

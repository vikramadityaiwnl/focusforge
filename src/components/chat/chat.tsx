import { Button, Input } from "@nextui-org/react"
import { LucideBot, LucideSend, LucideUser2 } from "lucide-react"
import { useConversationStore } from "../../states/conversation"
import { useEffect, useState, useRef } from "react"
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
  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (currentSession) setSessionConversation()
  }, [])

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [conversation])

  const handleConversation = async () => {
    if (isLoading) return

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

      let finalPrompt = `nUser Message: ${inputText}\n\nSession Name: ${currentSession?.name}`;

      if (inputText.includes("/todo") && currentSession?.todos) {
        finalPrompt = `Todos: ${JSON.stringify(currentSession.todos)}\n\nUser Message: ${finalPrompt}\n\nSession Name: ${currentSession?.name}`;
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
      <div ref={chatContainerRef} className="chat-card rounded shadow-sm flex-grow overflow-y-auto p-2">
        {conversation.map((message, index) => (
          <div key={index} className={`message ${message.type === "user" ? "text-right" : "text-left"} mb-2 flex ${message.type === "user" ? "justify-end" : "justify-start"} items-start`}>
            {message.type === "bot" && <LucideBot size={18} className="mr-2 flex-shrink-0" />}
            <Markdown 
              className={`markdown-container message-bubble prose ${message.type === "user" ? "bg-primary text-white" : "bg-default-100 text-default-900"} p-2 rounded text-sm`}
              components={{
                h1: ({node, ...props}) => <h1 {...props} className="text-lg font-bold mb-2 text-default-900 dark:text-white" />,
                h2: ({node, ...props}) => <h2 {...props} className="text-md font-bold mb-2 text-default-900 dark:text-white" />,
                h3: ({node, ...props}) => <h3 {...props} className="text-base font-bold mb-2 text-default-900 dark:text-white" />,
                p: ({node, ...props}) => <p {...props} className={`mb-2 ${message.type === "user" ? "bg-primary text-white" : "text-default-900 dark:text-white"}`} />,
                ul: ({node, ...props}) => <ul {...props} className="list-disc ml-4 mb-2 text-default-900 dark:text-white" />,
                ol: ({node, ...props}) => <ol {...props} className="list-decimal ml-4 mb-2 text-default-900 dark:text-white" />,
                strong: ({node, ...props}) => <strong {...props} className="font-bold text-default-900 dark:text-white" />
              }}
            >
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

      <p className="text-xs flex-shrink-0 text-neutral-500 text-center pb-2">AI responses may be limited in accuracy and context awareness. Use with discretion.</p>
    </div>
  )
}

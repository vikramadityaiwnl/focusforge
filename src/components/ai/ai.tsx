import { Button, Input } from "@nextui-org/react"
import { LucideBot, LucideSend, LucideUser2 } from "lucide-react"

export const AI = () => {
  const conversation = [
    {
      type: "user",
      text: "Hello"
    },
    {
      type: "bot",
      text: "Hi! How can I help you today?"
    },
    {
      type: "user",
      text: "I need help with my homework"
    },
    {
      type: "bot",
      text: "Sure! What subject is it?"
    },
    {
      type: "user",
      text: "Math"
    },
    {
      type: "bot",
      text: "What kind of math?"
    },
    {
      type: "user",
      text: "Algebra"
    },
    {
      type: "bot",
      text: "What specifically do you need help with?"
    },
    {
      type: "user",
      text: "Solving equations"
    },
    {
      type: "bot",
      text: "I can help with that! What equation do you need help with?"
    },
    {
      type: "user",
      text: "x + 5 = 10"
    },
    {
      type: "bot",
      text: "The solution to the equation x + 5 = 10 is x = 5"
    },
    {
      type: "user",
      text: "x + 5 = 10"
    },
    {
      type: "bot",
      text: "The solution to the equation x + 5 = 10 is x = 5"
    }
  ]

  return (
    <div className="flex flex-col w-full h-full">
      <div className="chat-card mb-4 rounded shadow-sm flex-grow overflow-y-auto p-2">
        {conversation.map((message, index) => (
          <div key={index} className={`message ${message.type === "user" ? "text-right" : "text-left"} mb-2 flex ${message.type === "user" ? "justify-end" : "justify-start"} items-center`}>
        {message.type === "bot" && <LucideBot size={18} className="mr-2 flex-shrink-0" />}
        <div className={`message-bubble ${message.type === "user" ? "bg-primary text-white" : "bg-default-100 text-default-900"} p-2 rounded text-sm`}>
          {message.text}
        </div>
        {message.type === "user" && <LucideUser2 size={18} className="ml-2 flex-shrink-0" />}
          </div>
        ))}
      </div>

      <Input
        placeholder="Enter text"
        endContent={
          <Button isIconOnly size="sm">
            <LucideSend size={18} />
          </Button>
        }
        className="flex-shrink-0 mb-2"
      />
    </div>
  )
}

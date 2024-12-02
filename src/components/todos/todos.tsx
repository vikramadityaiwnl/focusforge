import { LucideDelete, LucideListTodo, LucidePlus, LucideWandSparkles } from "lucide-react"
import { Todo, useSessionStore } from "../../states/session"
import { Button, Checkbox, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Tooltip, useDisclosure } from "@nextui-org/react"
import { useRef, useState } from "react"
import { v4 as uuid } from "uuid"
import { useAIModelsStore } from "../../states/models"
import Markdown from "react-markdown"
import { Spinner } from "../spinner/spinner"
import toast from "react-hot-toast"

export const Todos = () => {
  const { currentSession, setTodos, addTodo, removeTodo, updateTodo, todoInsights, setTodoInsights } = useSessionStore()
  const { magicModel } = useAIModelsStore()

  const [todoText, setTodoText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)

  const insightsModal = useDisclosure()
  const contextModal = useDisclosure()

  if (currentSession === null) return

  const handleAddTodo = () => {
    if (isLoading) return

    if (todoText.trim() === "") return

    const todo: Todo = {
      id: uuid(),
      name: todoText,
      completed: false,
    }

    addTodo(todo)
    setTodoText("")
  }

  const handleUpdateTodo = (id: string, todo: Todo, isSelected: boolean) => {
    updateTodo(id, { ...todo, completed: isSelected })
  }

  const handleMagic = async (isRetrying?: boolean, context?: string) => {
    if (!magicModel) return

    if (todoInsights !== "" && !isRetrying) {
      insightsModal.onOpen()
      return
    }

    setIsLoading(true)
    contextModal.onClose()

    try {
      const response = await magicModel.prompt(JSON.stringify({ todos: currentSession.todos, context, isRetrying }))
      const parsedResponse = JSON.parse(response)
      const insights = parsedResponse.insights
      const todos = parsedResponse.todos.reverse()

      setTodoInsights(insights)
      setTodos(todos)
      insightsModal.onOpen()
    } catch (error) {
      toast.error("Failed to generate insights. Please try again.")
      setTodoInsights("")
    } finally {
      setIsLoading(false)
      setIsRetrying(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex gap-2 justify-center items-center shrink-0">
        <Input placeholder="Enter your to-do" value={todoText} onValueChange={(e) => setTodoText(e)} onKeyDown={(e) => e.key === "Enter" && handleAddTodo()} />
        <Tooltip content="Add To-do" delay={1000}>
          <Button isIconOnly size="sm" onPress={handleAddTodo} disabled={isLoading}>
            <LucidePlus size={18} />
          </Button>
        </Tooltip>
        <Tooltip content="Magic ✨" delay={1000}>
          {
            isLoading ? (
              <Button isIconOnly size="sm" isLoading spinner={<Spinner />} />
            ) : (
              <Button isIconOnly size="sm" onPress={() => {
                if (currentSession.todos.length === 0) {
                  contextModal.onOpen()
                  return
                }

                handleMagic(false)
              }}>
                <LucideWandSparkles size={18} />
              </Button>
            )
          }
        </Tooltip>
      </div>
      {
        currentSession.todos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-neutral-500">
            <LucideListTodo size={64} />
            <p className="text-lg">No to-dos yet</p>
            <p className="text-xs flex-shrink-0 text-neutral-500 text-center mt-4">Nothing on mind? Use magic tool to get AI generated to-do's.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 overflow-y-auto flex-grow">
            {
              [...currentSession.todos].reverse().map((todo) => (
                <div key={todo.id} className="flex flex-row justify-between items-center gap-1 shrink-0">
                  <Checkbox key={todo.id} isSelected={todo.completed} onValueChange={(isSelected) => handleUpdateTodo(todo.id, todo, isSelected)}>
                    <p className={`${todo.completed ? 'line-through text-neutral-500' : ''}`}>{todo.name}</p>
                  </Checkbox>
                  <Button isIconOnly size="sm" onPress={() => removeTodo(todo.id)}>
                    <LucideDelete size={18} />
                  </Button>
                </div>
              ))
            }
          </div>
        )
      }

      <InsightsModal isOpen={insightsModal.isOpen} onClose={insightsModal.onClose} onRetry={() => {
        setIsRetrying(true)
        handleMagic(true)
      }} content={todoInsights} isRetrying={isRetrying} />

      <TodoContextModal isOpen={contextModal.isOpen} onClose={contextModal.onClose} handleMagic={handleMagic} />
    </div>
  )
}

interface InsightsModalProps {
  isOpen: boolean,
  onClose: () => void,
  onRetry: () => void,
  content: string,
  isRetrying: boolean
}
const InsightsModal = ({ isOpen, onClose, onRetry, content, isRetrying }: InsightsModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      scrollBehavior="inside"
      onClose={onClose}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              To-do Insights
            </ModalHeader>
            <ModalBody>
              <Markdown 
                className="markdown-container text-sm"
                components={{
                  h1: ({node, ...props}) => <h1 {...props} className="text-lg font-bold mb-2 text-default-900 dark:text-white" />,
                  h2: ({node, ...props}) => <h2 {...props} className="text-md font-bold mb-2 text-default-900 dark:text-white" />,
                  h3: ({node, ...props}) => <h3 {...props} className="text-base font-bold mb-2 text-default-900 dark:text-white" />,
                  p: ({node, ...props}) => <p {...props} className="mb-2 text-default-900 dark:text-white" />,
                  ul: ({node, ...props}) => <ul {...props} className="list-disc ml-4 mb-2 text-default-900 dark:text-white" />,
                  ol: ({node, ...props}) => <ol {...props} className="list-decimal ml-4 mb-2 text-default-900 dark:text-white" />,
                  strong: ({node, ...props}) => <strong {...props} className="font-bold text-default-900 dark:text-white" />
                }}
              >
                {content}
              </Markdown>
            </ModalBody>
            <ModalFooter>
              <Button color="default" fullWidth onPress={onClose} size="sm">
                Close
              </Button>
              {
                isRetrying ? (
                  <Button isLoading spinner={<Spinner />} fullWidth size="sm">
                    Retrying
                  </Button>
                ) : (
                  <Button color="primary" startContent={<LucideWandSparkles size={18} />} size="sm" fullWidth onPress={onRetry}>
                    Retry
                  </Button>
                )
              }
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

interface TodoContextModalProps {
  isOpen: boolean,
  onClose: () => void,
  handleMagic: (isRetrying?: boolean, context?: string) => void
}
const TodoContextModal = ({ isOpen, onClose, handleMagic }: TodoContextModalProps) => {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <Modal
      isOpen={isOpen}
      scrollBehavior="inside"
      onClose={onClose}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Generate AI To-do's
            </ModalHeader>
            <ModalBody className="flex flex-col gap-3">
              <Input ref={inputRef} fullWidth label="Context" isClearable autoFocus onKeyDown={(e) => e.key === "Enter" && inputRef.current && handleMagic(false, inputRef.current.value)} />
            </ModalBody>
            <ModalFooter>
              <Button color="default" fullWidth onPress={onClose} size="sm">
                Close
              </Button>
              <Button color="primary" startContent={<LucideWandSparkles size={18} />} size="sm" fullWidth onPress={() => inputRef.current && handleMagic(false, inputRef.current.value)}>
                Generate
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
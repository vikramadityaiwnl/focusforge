import { LucideDelete, LucideListTodo, LucidePlus, LucideWandSparkles } from "lucide-react"
import { Todo, useSessionStore } from "../../states/session"
import { Button, Checkbox, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Tooltip, useDisclosure } from "@nextui-org/react"
import { useState } from "react"
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

  if (currentSession === null) return

  const handleAddTodo = () => {
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

  const handleMagic = async (isRetrying: boolean) => {
    if (!magicModel) return
    if (currentSession.todos.length === 0) return
    
    if (todoInsights !== "" && !isRetrying) {
      insightsModal.onOpen()
      return
    }

    setIsLoading(true)

    try {
      const response = await magicModel.prompt(JSON.stringify({ todos: currentSession.todos, isRetrying }))
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
        <Input placeholder="todo" value={todoText} onValueChange={(e) => setTodoText(e)} onKeyDown={(e) => e.key === "Enter" && handleAddTodo()} />
        <Tooltip content="Add Todo">
          <Button isIconOnly size="sm" onPress={handleAddTodo}>
            <LucidePlus size={18} />
          </Button>
        </Tooltip>
        <Tooltip content="Magic ✨">
          {
            isLoading ? (
              <Button isIconOnly size="sm" isLoading spinner={<Spinner />} />
            ) : (
              <Button isIconOnly size="sm" onPress={() => handleMagic(false)}>
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
            <p className="text-lg">No todos yet</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 overflow-y-auto flex-grow">
            {
              [...currentSession.todos].reverse().map((todo) => (
                <div key={todo.id} className="flex flex-row justify-between items-center gap-1 shrink-0">
                  <Checkbox key={todo.id} lineThrough isSelected={todo.completed} onValueChange={(isSelected) => handleUpdateTodo(todo.id, todo, isSelected)}>{todo.name}</Checkbox>
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
                Todo Insights
              </ModalHeader>
              <ModalBody>
                <Markdown className="text-sm">
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
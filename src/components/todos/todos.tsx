import { LucideDelete, LucideListTodo, LucidePlus, LucideWandSparkles } from "lucide-react"
import { Todo, useSessionStore } from "../../states/session"
import { Button, Checkbox, Input, Tooltip } from "@nextui-org/react"
import { useState } from "react"
import { v4 as uuid } from "uuid"

export const Todos = () => {
  const { currentSession, addTodo, removeTodo, updateTodo } = useSessionStore()

  const [todoText, setTodoText] = useState("")

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

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex gap-2 justify-center items-center shrink-0">
        <Input placeholder="todo" value={todoText} onValueChange={(e) => setTodoText(e)} onKeyDown={(e) => e.key === "Enter" && handleAddTodo()} />
        <Tooltip content="Add Todo">
          <Button isIconOnly size="sm" onPress={handleAddTodo}>
            <LucidePlus size={18} />
          </Button>
        </Tooltip>
        <Tooltip content="AI Prioritization">
          <Button isIconOnly size="sm">
            <LucideWandSparkles size={18} />
          </Button>
        </Tooltip>
      </div>
      {
        currentSession.todos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-neutral-500">
            <LucideListTodo size={64} />
            <p className="text-lg font-semibold">No todos yet</p>
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
    </div>
  )
}

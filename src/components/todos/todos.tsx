import { LucideListTodo } from "lucide-react"
import { useSessionStore } from "../../states/session"

export const Todos = () => {
  const { currentSession } = useSessionStore()

  return (
    <div className="flex flex-col items-center justify-center gap-4 h-full">
      {
        currentSession?.todos.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-neutral-500">
            <LucideListTodo size={64} />
            <p className="text-lg font-semibold">No todos yet</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 h-full">
            <div className="flex flex-row items-center gap-4 p-4 w-full h-16 text-xl font-black tracking-widest good-border-bottom">
              <p className="text-lg font-semibold">Todos</p>
            </div>
          </div>
        )
      }
    </div>
  )
}

import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Session, useSessionStore } from "../states/session"
import { LucideArrowLeft, LucideChartArea, LucideGlobeLock, LucideMenu, LucideSettings2, LucideTrash2 } from "lucide-react"
import { AI, ChromeTabs, Pomodoro, Todos } from "../components"
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger, Tab, Tabs } from "@nextui-org/react"

export const SessionPage = () => {
  const location = useLocation()
  const navigation = useNavigate()

  const sessionId = location.pathname.slice(1)

  const [session, setSession] = useState<Session>()

  const { sessions, setCurrentSession } = useSessionStore()

  useEffect(() => {
    const currentSession = sessions.find((s) => s.id === sessionId)
    if (!currentSession) {
      navigation("/")
      return
    }

    setSession(currentSession)
    setCurrentSession(currentSession)
  }, [sessionId])

  if (session) {
    return (
      <div className="flex flex-col gap-4 h-screen overflow-hidden">
        <div className="flex flex-row items-center gap-4 p-4 w-full h-16 text-xl font-black tracking-widest good-border-bottom shrink-0">
          <Button startContent={<LucideArrowLeft size={18} />} onPress={() => navigation("/")} className="text-l font-semibold">
            {session.name}
          </Button>

          <Menu />
        </div>

        <Pomodoro />

        <SessionTabs />
      </div>
    )
  }
}

const Menu = () => {
  return (
    <Dropdown>
      <DropdownTrigger>
        <Button variant="bordered" isIconOnly className="ml-auto">
          <LucideMenu size={18} />
        </Button>
      </DropdownTrigger>
      <DropdownMenu variant="faded" aria-label="Dropdown menu with actions">
        <DropdownSection title="Actions" showDivider>
          <DropdownItem
            key="configure"
            startContent={<LucideSettings2 size={18} />}>
            Configure
          </DropdownItem>
          <DropdownItem
            key="analytics"
            startContent={<LucideChartArea size={18} />}>
            Analytics
          </DropdownItem>
          <DropdownItem
            key="blocked"
            startContent={<LucideGlobeLock size={18} />}>
            Blocked Websites
          </DropdownItem>
        </DropdownSection>
        <DropdownSection title="Danger Zone">
          <DropdownItem
            key="delete"
            color="danger"
            className="text-danger"
            startContent={<LucideTrash2 size={18} />}>
            Delete Session
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  )
}

const tabs = [
  {
    id: "todos",
    label: "Todos",
    content: <Todos />
  },
  {
    id: "tabs",
    label: "Tabs",
    content: <ChromeTabs />
  },
  {
    id: "ai",
    label: "AI",
    content: <AI />
  }
]
const SessionTabs = () => {
  return (
    <div className="flex w-full h-full flex-col p-4 overflow-hidden mb-4">
      <Tabs aria-label="session tabs" items={tabs} fullWidth size="md" className="flex-shrink-0">
        {
          (item) => (
            <Tab key={item.id} title={item.label} className="h-full flex-grow-0">
              {item.content}
            </Tab>
          )
        }
      </Tabs>
    </div>
  )
}
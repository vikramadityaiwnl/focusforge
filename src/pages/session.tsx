import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Session, useSessionStore } from "../states/session"
import { LucideArrowLeft, LucideChartArea, LucideMenu, LucideSettings2, LucideTrash2 } from "lucide-react"
import { Pomodoro } from "../components"
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger } from "@nextui-org/react"

export const SessionPage = () => {
  const location = useLocation()
  const navigation = useNavigate()

  const sessionId = location.pathname.slice(1)

  const [session, setSession] = useState<Session>()

  const { sessions } = useSessionStore()

  useEffect(() => {
    const currentSession = sessions.find((s) => s.id === sessionId)
    if (!currentSession) {
      navigation("/")
    }

    setSession(currentSession)
  }, [sessionId])

  if (session) {
    return (
      <div className="flex flex-col gap-4 h-full">
        <div className="flex flex-row items-center gap-4 p-4 w-full h-16 text-xl font-black tracking-widest good-border-bottom shrink-0">
          <Button startContent={<LucideArrowLeft size={18} />} onPress={() => navigation("/")} className="text-l font-semibold">
            {session.name}
          </Button>

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
                  key="configure"
                  startContent={<LucideChartArea size={18} />}>
                    Analytics
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
        </div>

        <Pomodoro />
      </div>
    )
  }
}
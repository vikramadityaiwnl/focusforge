import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Session, useSessionStore } from "../states/session"
import { LucideArrowLeft, LucideChartArea, LucideMenu, LucideMessageCircleX, LucideMinus, LucideMoon, LucidePlus, LucideSettings2, LucideSun, LucideTrash2 } from "lucide-react"
import { Chat, ChromeTabs, Pomodoro, Todos } from "../components"
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Switch, Tab, Tabs, useDisclosure } from "@nextui-org/react"
import { useTheme } from "next-themes"
import { useConfigureStore } from "../states/configure"
import { useConversationStore } from "../states/conversation"

export const SessionPage = () => {
  const location = useLocation()
  const navigation = useNavigate()

  const sessionId = location.pathname.slice(1)

  const [session, setSession] = useState<Session>()

  const deleteDialog = useDisclosure()
  const configDialog = useDisclosure()
  const deleteChatDialog = useDisclosure()

  const { sessions, setCurrentSession } = useSessionStore()
  const { showPomodoroClock } = useConfigureStore()
  const { setSessionId } = useConversationStore()

  useEffect(() => {
    const currentSession = sessions.find((s) => s.id === sessionId)
    if (!currentSession) {
      navigation("/")
      return
    }

    setSession(currentSession)
    setCurrentSession(currentSession)
    setSessionId(sessionId)
  }, [sessionId])

  if (session) {
    return (
      <div className="flex flex-col gap-4 h-screen overflow-hidden">
        <div className="flex flex-row items-center gap-4 p-4 w-full h-16 text-xl font-black tracking-widest good-border-bottom shrink-0">
          <Button startContent={<LucideArrowLeft className="shrink-0" size={18} />} onPress={() => navigation("/")} className="text-l font-semibold flex items-center gap-2">
            <span className="truncate">{session.name}</span>
          </Button>

          <Menu openDeleteDialog={deleteDialog.onOpen} openConfigurationDialog={configDialog.onOpen} openDeleteChatDialog={deleteChatDialog.onOpen} />
        </div>

        {showPomodoroClock && <Pomodoro />}

        <SessionTabs />

        <DeleteSessionDialog isOpen={deleteDialog.isOpen} onClose={deleteDialog.onClose} />
        <DeleteChatDialog isOpen={deleteChatDialog.isOpen} onClose={deleteChatDialog.onClose} />
        <ConfigurationDialog isOpen={configDialog.isOpen} onClose={configDialog.onClose} />
      </div>
    )
  }
}

interface MenuProps {
  openDeleteDialog: () => void
  openConfigurationDialog: () => void
  openDeleteChatDialog: () => void
}
const Menu = ({ openDeleteDialog, openConfigurationDialog, openDeleteChatDialog }: MenuProps) => {
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
            onPress={openConfigurationDialog}
            key="configure"
            startContent={<LucideSettings2 size={18} />}>
            Configure
          </DropdownItem>
          <DropdownItem
            key="analytics"
            startContent={<LucideChartArea size={18} />}>
            Analytics
          </DropdownItem>
        </DropdownSection>
        <DropdownSection title="Danger Zone">
          <DropdownItem
            onPress={openDeleteChatDialog}
            key="delete-chat"
            color="danger"
            className="text-danger"
            startContent={<LucideMessageCircleX size={18} />}>
            Delete Chat
          </DropdownItem>
          <DropdownItem
            onPress={openDeleteDialog}
            key="delete-session"
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
    id: "chat",
    label: "Chat",
    content: <Chat />
  }
]
const SessionTabs = () => {
  return (
    <div className="flex w-full h-full flex-col p-4 overflow-hidden mb-2">
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

const ConfigurationDialog = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { theme, setTheme } = useTheme()
  const { showPomodoroClock, focusTimeInMinutes, setFocusTimeInMinutes, breakTimeInMinutes, setBreakTimeInMinutes, setShowPomodoroClock, aiWebsiteBlockerEnabled, setAiWebsiteBlockerEnabled } = useConfigureStore()

  return (
    <Modal backdrop="blur" isOpen={isOpen} onClose={onClose} placement="center">
      <ModalContent>
        {
          (onClose) => (
            <>
              <ModalHeader>Configure</ModalHeader>
              <ModalBody className="flex flex-col gap-4">
                <div className="flex flex-row justify-between gap-4">
                  <span>Show Pomodoro Clock</span>
                  <Switch size="sm" isSelected={showPomodoroClock} onValueChange={(isSelected) => setShowPomodoroClock(isSelected)} />
                </div>

                {
                  showPomodoroClock && (
                    <div className="flex flex-row justify-between gap-4 mt-4">
                      <Input 
                      type="number" 
                      label="Focus Time (minutes)"
                      size="sm"
                      labelPlacement="outside"
                      value={focusTimeInMinutes.toString()} 
                      disabled
                      classNames={{
                        input: "text-center"
                      }}
                      startContent={
                        <Button 
                        isIconOnly 
                        variant="light" 
                        color="default" 
                        onPress={() => setFocusTimeInMinutes(Math.max(5, focusTimeInMinutes - 5))}
                        isDisabled={focusTimeInMinutes <= 5}
                        >
                        <LucideMinus size={18} />
                        </Button>
                      }
                      endContent={
                        <Button 
                        isIconOnly 
                        variant="light" 
                        color="default" 
                        onPress={() => setFocusTimeInMinutes(Math.min(120, focusTimeInMinutes + 5))}
                        isDisabled={focusTimeInMinutes >= 120}
                        >
                        <LucidePlus size={18} />
                        </Button>
                      } 
                      />
                      <Input 
                      type="number" 
                      label="Break Time (minutes)"
                      labelPlacement="outside"
                      size="sm"
                      value={breakTimeInMinutes.toString()} 
                      disabled
                      classNames={{
                        input: "text-center"
                      }}
                      startContent={
                        <Button 
                        isIconOnly 
                        variant="light" 
                        color="default"
                        onPress={() => setBreakTimeInMinutes(Math.max(5, breakTimeInMinutes - 5))}
                        isDisabled={breakTimeInMinutes <= 5}
                        >
                        <LucideMinus size={18} />
                        </Button>
                      }
                      endContent={
                        <Button 
                        isIconOnly 
                        variant="light" 
                        color="default"
                        onPress={() => setBreakTimeInMinutes(Math.min(30, breakTimeInMinutes + 5))}
                        isDisabled={breakTimeInMinutes >= 30}
                        >
                        <LucidePlus size={18} />
                        </Button>
                      } 
                      />
                    </div>
                  )
                }

                <div className="flex flex-row justify-between gap-4">
                  <span>AI Website Blocker</span>
                  <Switch size="sm" isSelected={aiWebsiteBlockerEnabled} onValueChange={(isSelected) => setAiWebsiteBlockerEnabled(isSelected)} />
                </div>

                <Switch
                  defaultSelected
                  size="md"
                  color="primary"
                  className="mt-4"
                  onValueChange={() => setTheme(theme === "dark" ? "light" : "dark")}
                  thumbIcon={({ className }) =>
                    theme === "dark" ? (
                      <LucideMoon size={18} className={className} />
                    ) : (
                      <LucideSun size={18} className={className} />
                    )
                  } />
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )
        }
      </ModalContent>
    </Modal>
  )
}

const DeleteSessionDialog = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { currentSession, removeSession } = useSessionStore()
  const navigation = useNavigate()

  return (
    <Modal backdrop="blur" isOpen={isOpen} onClose={onClose} placement="center">
      <ModalContent>
        {
          (onClose) => (
            <>
              <ModalHeader>Delete Session</ModalHeader>
              <ModalBody>
                Are you sure you want to delete this session? This action cannot be undone.
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="danger" onPress={() => {
                  removeSession(currentSession?.id || "")
                  onClose()
                  navigation("/")
                }}>
                  Delete
                </Button>
              </ModalFooter>
            </>
          )
        }
      </ModalContent>
    </Modal>
  )
}

const DeleteChatDialog = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { clearMessages } = useConversationStore()

  return (
    <Modal backdrop="blur" isOpen={isOpen} onClose={onClose} placement="center">
      <ModalContent>
        {
          (onClose) => (
            <>
              <ModalHeader>Delete Chat</ModalHeader>
              <ModalBody>
                Are you sure you want to delete chat from this session? This action cannot be undone.
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="danger" onPress={() => {
                  clearMessages()
                  onClose()
                }}>
                  Delete
                </Button>
              </ModalFooter>
            </>
          )
        }
      </ModalContent>
    </Modal>
  )
}
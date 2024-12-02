import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Session, useSessionStore } from "../states/session"
import { LucideArrowLeft, LucideChartArea, LucideMenu, LucideMessageCircleX, LucideMinus, LucideMoon, LucidePlus, LucideSettings2, LucideSun, LucideTrash2 } from "lucide-react"
import { Chat, ChromeTabs, Clipboard, Pomodoro, Todos } from "../components"
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Switch, Tab, Tabs, useDisclosure } from "@nextui-org/react"
import { useTheme } from "next-themes"
import { useConfigureStore } from "../states/configure"
import { useConversationStore } from "../states/conversation"
import toast from "react-hot-toast"
import { shouldBlockWebsite } from "../states/models"

export const SessionPage = () => {
  const location = useLocation()
  const navigation = useNavigate()

  const sessionId = location.pathname.slice(1)

  const [session, setSession] = useState<Session>()

  const deleteDialog = useDisclosure()
  const configDialog = useDisclosure()
  const deleteChatDialog = useDisclosure()

  const { sessions, setCurrentSession, currentSession } = useSessionStore()
  const { showPomodoroClock } = useConfigureStore()
  const { setSessionId } = useConversationStore()

  useEffect(() => {
    const handleWebsiteBlocker = async () => {
      try {
        const { aiWebsiteBlockerEnabled } = useConfigureStore.getState();
        if (!aiWebsiteBlockerEnabled || !currentSession?.name) {
          return;
        }

        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const tab = tabs.find(tab => 
          tab.url && 
          tab.title && 
          tab.status === "complete" && 
          !tab.url.startsWith("chrome://") &&
          tab.url !== "chrome://newtab/" &&
          tab.url !== "about:blank"
        );

        if (!tab?.id || !tab.url || !tab.title) {
          return;
        }

        const [{ result: tabContent }] = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => document.body.innerText,
        });

        if (!tabContent) {
          toast.error("Could not check content from tab.");
          return;
        }

        const shouldBlock = await shouldBlockWebsite(
          tab.url,
          tab.title,
          tabContent,
          currentSession.name
        );

        if (shouldBlock) {
          const confirmed = window.confirm("This website may distract you from your focus session. Do you want to close it?");
          if (confirmed) {
            await chrome.tabs.remove(tab.id);
          }
        }
      } catch (error) {
        console.error('Website blocker error:', error);
        toast.error("Error checking website content");
      }
    };

    const setup = async () => {
      chrome.tabs.onUpdated.addListener(handleWebsiteBlocker);
      chrome.tabs.onActivated.addListener(handleWebsiteBlocker);
    };

    setup();

    return () => {
      chrome.tabs.onUpdated.removeListener(handleWebsiteBlocker);
      chrome.tabs.onActivated.removeListener(handleWebsiteBlocker);
    };
  }, [currentSession]);

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
    id: "todo",
    label: "To-do",
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
  },
  {
    id: "clipboard",
    label: "Clipboard",
    content: <Clipboard />
  }
]
const SessionTabs = () => {
  const { showTodo, showTabs, showChat, showClipboard } = useConfigureStore()

  const visibleTabs = tabs.filter(item => {
    if (item.id === "todo" && !showTodo) return false
    if (item.id === "tabs" && !showTabs) return false
    if (item.id === "chat" && !showChat) return false
    if (item.id === "clipboard" && !showClipboard) return false
    return true
  })

  return (
    <div className="flex w-full h-full flex-col p-4 overflow-hidden mb-2">
      <Tabs aria-label="session tabs" items={visibleTabs} fullWidth size="md" className="flex-shrink-0">
        {(item) => (
          <Tab key={item.id} title={item.label} className="h-full flex-grow-0">
            {item.content}
          </Tab>
        )}
      </Tabs>
    </div>
  )
}

const ConfigurationDialog = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { theme, setTheme } = useTheme()
  const configuration = useConfigureStore()

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
                  <Switch size="sm" isSelected={configuration.showPomodoroClock} onValueChange={(isSelected) => configuration.setShowPomodoroClock(isSelected)} />
                </div>

                {
                  configuration.showPomodoroClock && (
                    <div className="flex flex-row justify-between gap-4 mt-4">
                      <Input 
                      type="number" 
                      label="Focus Time (minutes)"
                      size="sm"
                      labelPlacement="outside"
                      value={configuration.focusTimeInMinutes.toString()} 
                      disabled
                      classNames={{
                        input: "text-center"
                      }}
                      startContent={
                        <Button 
                        isIconOnly 
                        variant="light" 
                        color="default" 
                        onPress={() => configuration.setFocusTimeInMinutes(Math.max(5, configuration.focusTimeInMinutes - 5))}
                        isDisabled={configuration.focusTimeInMinutes <= 5}
                        >
                        <LucideMinus size={18} />
                        </Button>
                      }
                      endContent={
                        <Button 
                        isIconOnly 
                        variant="light" 
                        color="default" 
                        onPress={() => configuration.setFocusTimeInMinutes(Math.min(120, configuration.focusTimeInMinutes + 5))}
                        isDisabled={configuration.focusTimeInMinutes >= 120}
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
                      value={configuration.breakTimeInMinutes.toString()} 
                      disabled
                      classNames={{
                        input: "text-center"
                      }}
                      startContent={
                        <Button 
                        isIconOnly 
                        variant="light" 
                        color="default"
                        onPress={() => configuration.setBreakTimeInMinutes(Math.max(5, configuration.breakTimeInMinutes - 5))}
                        isDisabled={configuration.breakTimeInMinutes <= 5}
                        >
                        <LucideMinus size={18} />
                        </Button>
                      }
                      endContent={
                        <Button 
                        isIconOnly 
                        variant="light" 
                        color="default"
                        onPress={() => configuration.setBreakTimeInMinutes(Math.min(30, configuration.breakTimeInMinutes + 5))}
                        isDisabled={configuration.breakTimeInMinutes >= 30}
                        >
                        <LucidePlus size={18} />
                        </Button>
                      } 
                      />
                    </div>
                  )
                }

                <div className="flex flex-row justify-between gap-4">
                  <span>To-do</span>
                  <Switch size="sm" isSelected={configuration.showTodo} onValueChange={(isSelected) => configuration.setShowTodo(isSelected)} />
                </div>

                <div className="flex flex-row justify-between gap-4">
                  <span>Tabs</span>
                  <Switch size="sm" isSelected={configuration.showTabs} onValueChange={(isSelected) => configuration.setShowTabs(isSelected)} />
                </div>

                <div className="flex flex-row justify-between gap-4">
                  <span>Chat</span>
                  <Switch size="sm" isSelected={configuration.showChat} onValueChange={(isSelected) => configuration.setShowChat(isSelected)} />
                </div>

                <div className="flex flex-row justify-between gap-4">
                  <span>Clipboard</span>
                  <Switch size="sm" isSelected={configuration.showClipboard} onValueChange={(isSelected) => configuration.setShowClipboard(isSelected)} />
                </div>

                <div className="flex flex-row justify-between gap-4">
                  <span>AI Website Blocker</span>
                  <Switch size="sm" isSelected={configuration.aiWebsiteBlockerEnabled} onValueChange={(isSelected) => configuration.setAiWebsiteBlockerEnabled(isSelected)} />
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
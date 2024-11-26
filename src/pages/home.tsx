import { LucideAlarmClock, LucidePlus } from "lucide-react"
import { useSessionStore } from "../states/session"
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Input, Card, CardBody } from "@nextui-org/react";
import { v4 as uuid } from "uuid"
import { useRef } from "react";
import { Link } from "react-router-dom";

export const HomePage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <div className="flex flex-col justify-between items-center h-screen gap-8">
      <HomeNav />

      <HomeSessions />

      <Button color="primary" className="mb-8 shrink-0" startContent={<LucidePlus size={18} />} onPress={onOpen}>
        Create Session
      </Button>

      <CreateSessionModal isOpen={isOpen} onClose={onClose} />
    </div>
  )
}

const HomeNav = () => {
  return (
    <div className="flex flex-row items-center justify-center w-full h-16 text-2xl font-black tracking-widest good-border-bottom shrink-0">
      focusforge
    </div>
  )
}

const HomeSessions = () => {
  const { sessions } = useSessionStore()

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full text-neutral-500">
        <div className="flex flex-col items-center justify-center gap-4">
          <LucideAlarmClock size={48} className="" />
          <div className="font-bold text-xl">
            No sessions found
          </div>
          <div className="text-sm">
            Create a session to get started
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col overflow-y-auto">
      {
        [...sessions].reverse().map((session) => (
          <Link to={`/${session.id}`} key={session.id}>
            <Card className="w-80 cursor-pointer hover:opacity-80 transition-opacity shrink-0 m-2">
              <CardBody className="h-32 flex flex-col justify-between p-4">
                <p className="font-medium text-lg truncate">{session.name}</p>
                <p className="text-sm text-neutral-500">{new Date(session.createdOn).toLocaleDateString()}</p>
                <p className="text-sm text-neutral-500">{session.totalTasks} tasks</p>
              </CardBody>
            </Card>
          </Link>
        ))
      }
    </div>
  )
}

const CreateSessionModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { addSession } = useSessionStore()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleCreateSession = () => {
    if (!inputRef.current) return
    if (!inputRef.current.value) return

    addSession({
      id: uuid(),
      name: inputRef.current.value,
      createdOn: new Date().toISOString(),
      totalTasks: 0,
      todos: [],
      pomodoro: {
        focusTimeInMinutes: 25,
        breakTimeInMinutes: 5,
      }
    }),

    onClose()
  }

  return (
    <Modal backdrop="blur" isOpen={isOpen} onClose={onClose} placement="center">
      <ModalContent>
        {
          (onClose) => (
            <>
              <ModalHeader>Create Session</ModalHeader>
              <ModalBody>
                <Input ref={inputRef} label="Session Name" isClearable autoFocus onKeyDown={(e) => e.key === "Enter" && handleCreateSession()} />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={handleCreateSession}>
                  Create
                </Button>
              </ModalFooter>
            </>
          )
        }
      </ModalContent>
    </Modal>
  )
}
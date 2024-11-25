import { LucideAlarmClock, LucidePlus } from "lucide-react"
import { useSessionStore } from "../states/session"
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Input, Card, CardBody } from "@nextui-org/react";
import { v4 as uuid } from "uuid"
import { useRef } from "react";

export const Home = () => {
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
  const { sessionList } = useSessionStore()

  if (sessionList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full">
        <div className="flex flex-col items-center justify-center gap-4">
          <LucideAlarmClock size={48} className="text-neutral-500" />
          <div className="font-bold text-xl text-neutral-500">
            No sessions found
          </div>
          <div className="text-sm text-neutral-500">
            Create a session to get started
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col overflow-y-auto">
      {
        sessionList.map((session) => (
          <Card key={session.id} className="w-80 cursor-pointer hover:opacity-80 transition-opacity shrink-0 m-2">
            <CardBody className="h-32 flex flex-col justify-between p-4">
              <p className="font-medium text-lg truncate">{session.name}</p>
              <p className="text-sm text-neutral-500">{new Date(session.createdOn).toLocaleDateString()}</p>
              <p className="text-sm text-neutral-500">{session.totalTasks} tasks</p>
            </CardBody>
          </Card>
        ))
      }
    </div>
  )
}

const CreateSessionModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { addSessionList } = useSessionStore()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleCreateSession = () => {
    if (!inputRef.current) return
    if (!inputRef.current.value) return

    addSessionList({
      id: uuid(),
      name: inputRef.current.value,
      createdOn: new Date().toISOString(),
      totalTasks: 0,
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
                <Input ref={inputRef} label="Session Name" isClearable />
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
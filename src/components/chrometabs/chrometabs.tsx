import { Button, Card, CardBody, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@nextui-org/react"
import { LucidePanelTop, LucideScanText } from "lucide-react"
import { useEffect, useState } from "react"
import { reInitializeSummaryModel, useAIModelsStore } from "../../states/models"
import toast from "react-hot-toast"
import { Spinner } from "../spinner/spinner"
import Markdown from "react-markdown"

interface SummaryInterface {
  id: string,
  title: string,
  content: string
}

export const ChromeTabs = () => {
  const [tabs, setTabs] = useState<chrome.tabs.Tab[]>([])
  const [summary, setSummary] = useState<SummaryInterface>()
  const [selectedTab, setSelectedTab] = useState<chrome.tabs.Tab>()

  const [isLoading, setIsLoading] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)

  const summaryModal = useDisclosure()

  const { summarizeModel } = useAIModelsStore()

  useEffect(() => {
    const handleTabChange = () => {
      chrome.tabs.query({}, (tabs) => {
        const newTabs = tabs.filter(tab => 
          !tab.url?.startsWith("chrome://") && 
          tab.url !== "chrome://newtab/" &&
          tab.url !== "about:blank" &&
          tab.status === "complete" &&
          tab.url &&
          tab.title
        )
        setTabs(newTabs)
      })
    }

    setTimeout(handleTabChange, 500)

    chrome.tabs.onCreated.addListener(handleTabChange)
    chrome.tabs.onRemoved.addListener(handleTabChange)
    chrome.tabs.onUpdated.addListener(handleTabChange)

    return () => {
      chrome.tabs.onCreated.removeListener(handleTabChange)
      chrome.tabs.onRemoved.removeListener(handleTabChange)
      chrome.tabs.onUpdated.removeListener(handleTabChange)
    }
  }, [])

  const handleSummarize = async (tab: chrome.tabs.Tab) => {
    if (tab.id === undefined) return
    if (!summarizeModel) {
      toast.error("Summarize model not available.")
      return
    }
    
    try {
      setSelectedTab(tab)
      setIsLoading(true)

      const result = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          return document.body.innerText
        }
      })

      const tabcontent = result[0].result
      if (!tabcontent || !tab.id) {
        toast.error("Could not extract content from tab.")
        return
      }

      const summarizedContent = await summarizeModel.summarize(tabcontent)
      
      const summary: SummaryInterface = {
        id: tab.id.toString(),
        title: tab.title as string,
        content: summarizedContent
      }
      setSummary(summary)
      summaryModal.onOpen()

    } catch (error) {
      toast.error("An error occurred while summarizing the content.")
    } finally {
      setIsLoading(false)
      setIsRetrying(false)
      reInitializeSummaryModel()
    }
  }

  return (
    tabs.length === 0 ? (
      <div className="flex flex-col justify-center items-center gap-4 h-full text-neutral-500">
        <LucidePanelTop size={64} />
        <p className="text-lg text-center">No tabs found</p>
      </div>
    ) : (
      <div className="flex flex-col gap-4 h-full overflow-y-auto flex-grow">
        {
          tabs.map((tab, idx) => {
            return (
              <Card isDisabled={isLoading} key={tab.id} className={`flex flex-col gap-2 p-2 justify-between items-center shrink-0 ${idx === tabs.length - 1 && "mb-4"}`}>
                <CardBody className="flex flex-row gap-4 items-center">
                  <img src={tab.favIconUrl} alt="favicon" className="w-6 h-6 rounded-full" />
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-semibold truncate">{tab.title}</p>
                    <p className="text-xs text-neutral-500 truncate">{tab.url}</p>
                  </div>
                </CardBody>
                {
                  (isLoading && selectedTab?.id === tab.id) ? (
                    <Button isLoading spinner={<Spinner />} fullWidth size="sm">
                      Summarizing
                    </Button>
                  ) : (
                    <Button onPress={() => handleSummarize(tab)} startContent={<LucideScanText size={18} />} fullWidth size="sm" isDisabled={isLoading}>
                      Summarize
                    </Button>
                  )
                }
              </Card>
            )
          })
        }

        <SummaryModal isOpen={summaryModal.isOpen} onClose={summaryModal.onClose} title={selectedTab?.title as string} content={summary?.content as string} isRetrying={isRetrying} onRetry={() => {
          setIsRetrying(true)
          handleSummarize(selectedTab as chrome.tabs.Tab)
        }} />
      </div>
    )
  )
}

interface SummaryModalProps {
  isOpen: boolean,
  onClose: () => void,
  onRetry: () => void,
  title: string,
  content: string,
  isRetrying: boolean
}
const SummaryModal = ({ isOpen, onClose, onRetry, title, content, isRetrying }: SummaryModalProps) => {
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
                {title}
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
                    <Button color="primary" startContent={<LucideScanText size={18} />} size="sm" fullWidth onPress={onRetry}>
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
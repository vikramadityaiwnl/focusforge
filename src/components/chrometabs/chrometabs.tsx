import { Button, Card, CardBody } from "@nextui-org/react"
import { LucidePanelTop, LucideScanText } from "lucide-react"
import { useEffect, useState } from "react"

export const ChromeTabs = () => {
  const [tabs, setTabs] = useState<chrome.tabs.Tab[]>([])

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

  const handleSummarize = (tab: chrome.tabs.Tab) => {
    if (tab.id === undefined) return
    
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        return document.body.innerText
      }
    }).then((result) => {
      const tabcontent = result[0].result
      console.log(tabcontent)
    })
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
              <Card key={tab.id} className={`flex flex-col gap-2 p-2 justify-between items-center shrink-0 ${idx === tabs.length - 1 && "mb-4"}`}>
                <CardBody className="flex flex-row gap-4 items-center">
                  <img src={tab.favIconUrl} alt="favicon" className="w-6 h-6 rounded-full" />
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-semibold truncate">{tab.title}</p>
                    <p className="text-xs text-neutral-500 truncate">{tab.url}</p>
                  </div>
                </CardBody>
                <Button onPress={() => handleSummarize(tab)} startContent={<LucideScanText size={18} />} fullWidth size="sm">
                  Summarize
                </Button>
              </Card>
            )
          })
        }
      </div>
    )
  )
}

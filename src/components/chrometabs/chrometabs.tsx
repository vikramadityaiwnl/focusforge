import { Button, Card, CardBody } from "@nextui-org/react"
import { LucideScanText } from "lucide-react"
import { useEffect, useState } from "react"

export const ChromeTabs = () => {
  const [tabs, setTabs] = useState<chrome.tabs.Tab[]>([])

  useEffect(() => {
    const getAllTabs = async (): Promise<chrome.tabs.Tab[]> => {
      const queryOptions: chrome.tabs.QueryInfo = {}
      const tabs = await chrome.tabs.query(queryOptions)
      return tabs
    }

    getAllTabs().then((tabs) => {
      setTabs(tabs)
    })
  }, [])

  // useEffect(() => {
  //   const demoTabs = [
  //     {
  //       "active": false,
  //       "audible": false,
  //       "autoDiscardable": true,
  //       "discarded": false,
  //       "favIconUrl": "https://www.gstatic.com/devrel-devsite/prod/v870e399c64f7c43c99a3043db4b3a74327bb93d0914e84a0c3dba90bbfd67625/chrome/images/favicon.png",
  //       "frozen": false,
  //       "groupId": -1,
  //       "height": 953,
  //       "highlighted": false,
  //       "id": 1811715825,
  //       "incognito": false,
  //       "index": 0,
  //       "lastAccessed": 1732699598462.521,
  //       "mutedInfo": {
  //         "muted": false
  //       },
  //       "pinned": false,
  //       "selected": false,
  //       "status": "complete",
  //       "title": "Built-in AI | AI on Chrome | Chrome for Developers",
  //       "url": "https://developer.chrome.com/docs/ai/built-in",
  //       "width": 1541,
  //       "windowId": 1811715824
  //     },
  //     {
  //       "active": false,
  //       "audible": false,
  //       "autoDiscardable": true,
  //       "discarded": false,
  //       "favIconUrl": "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>%E2%9C%A8</text></svg>",
  //       "frozen": false,
  //       "groupId": -1,
  //       "height": 953,
  //       "highlighted": false,
  //       "id": 1811715857,
  //       "incognito": false,
  //       "index": 1,
  //       "lastAccessed": 1732699599261.867,
  //       "mutedInfo": {
  //         "muted": false
  //       },
  //       "pinned": false,
  //       "selected": false,
  //       "status": "complete",
  //       "title": "Prompt API Playground",
  //       "url": "https://chrome.dev/web-ai-demos/prompt-api-playground/",
  //       "width": 1541,
  //       "windowId": 1811715824
  //     },
  //     {
  //       "active": true,
  //       "audible": false,
  //       "autoDiscardable": true,
  //       "discarded": false,
  //       "favIconUrl": "https://ssl.gstatic.com/chrome/webstore/images/icon_48px.png",
  //       "frozen": false,
  //       "groupId": -1,
  //       "height": 953,
  //       "highlighted": true,
  //       "id": 1811715858,
  //       "incognito": false,
  //       "index": 2,
  //       "lastAccessed": 1732699602605.54,
  //       "mutedInfo": {
  //         "muted": false
  //       },
  //       "openerTabId": 1811715857,
  //       "pinned": false,
  //       "selected": true,
  //       "status": "complete",
  //       "title": "Chrome Web Store",
  //       "url": "https://chromewebstore.google.com/",
  //       "width": 1541,
  //       "windowId": 1811715824
  //     },
  //     {
  //       "active": true,
  //       "audible": false,
  //       "autoDiscardable": true,
  //       "discarded": false,
  //       "favIconUrl": "https://ssl.gstatic.com/chrome/webstore/images/icon_48px.png",
  //       "frozen": false,
  //       "groupId": -1,
  //       "height": 953,
  //       "highlighted": true,
  //       "id": 18117135858,
  //       "incognito": false,
  //       "index": 2,
  //       "lastAccessed": 1732699602605.54,
  //       "mutedInfo": {
  //         "muted": false
  //       },
  //       "openerTabId": 1811715857,
  //       "pinned": false,
  //       "selected": true,
  //       "status": "complete",
  //       "title": "Chrome Web Store",
  //       "url": "https://chromewebstore.google.com/",
  //       "width": 1541,
  //       "windowId": 1811715824
  //     }
  //   ]
  //   setTabs(demoTabs)
  // }, [])

  const handleSummarize = (tab: chrome.tabs.Tab) => {
    if (tab.id === undefined) return
    
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        return document.body.innerText
      }
    }).then((result) => {
      const tabcontent = result[0].result
    })
  }

  return (
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
}

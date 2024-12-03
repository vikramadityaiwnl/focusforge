import { useEffect, useRef } from "react"
import { useSessionStore } from "../../states/session"
import { LucideClipboard, LucideTrash2 } from "lucide-react"
import { Button } from "@nextui-org/react"
import toast from "react-hot-toast";

// Add these utility functions at the top
const convertBlobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const isBase64Image = (str: string) => str.startsWith('data:image/');

export const Clipboard = () => {
  const { clipboard, addToClipboard, removeFromClipboard } = useSessionStore()

  const ref = useRef<HTMLDivElement>(null)

  const handleCopyToClipboard = async (item: string) => {
    try {
      if (isBase64Image(item)) {
        // Request clipboard permission first
        const permission = await navigator.permissions.query({ name: 'clipboard-write' as PermissionName });
        if (permission.state === 'denied') {
          throw new Error('Clipboard permission denied');
        }

        // Simpler blob creation from base64
        const response = await fetch(item);
        const blob = await response.blob();
        
        // Ensure we're using a supported MIME type
        const mimeType = blob.type === 'image/jpeg' ? 'image/png' : blob.type;
        const convertedBlob = new Blob([await blob.arrayBuffer()], { type: mimeType });

        if ('write' in navigator.clipboard) {
          const clipboardItem = new ClipboardItem({
            [mimeType]: convertedBlob
          });
          await navigator.clipboard.write([clipboardItem]);
          toast.success('Image copied to clipboard!');
        } else {
          window.open(item, '_blank');
          toast.success('Image opened in new tab (copying not supported in this browser)');
        }
      } else {
        await navigator.clipboard.writeText(item);
        toast.success('Text copied to clipboard!');
      }
    } catch (error) {
      console.error('Clipboard error:', error);
      toast.error(`Failed to copy to clipboard: ${error instanceof Error ? error.message : 'Unknown error'}`);
      if (isBase64Image(item)) {
        window.open(item, '_blank');
        toast.success('Image opened in new tab instead');
      }
    }
  };

  useEffect(() => {
    const handlePaste = async (event: ClipboardEvent) => {
      event.preventDefault();
      const text = event.clipboardData?.getData('text');
      const items = event.clipboardData?.items;

      let hasImage = false;

      if (items) {
        for (const item of items) {
          if (item.type.startsWith('image/')) {
            hasImage = true;
            const blob = item.getAsFile();
            if (blob) {
              try {
                const base64 = await convertBlobToBase64(blob);
                // Ensure we're storing the complete data URL with MIME type
                addToClipboard(base64);
              } catch (error) {
                console.error('Error converting image:', error);
                toast.error('Failed to process image');
              }
            }
          }
        }
      }

      if (text && !hasImage) {
        addToClipboard(text);
      }
    };

    const handleDrop = async (event: DragEvent) => {
      event.preventDefault();
      const text = event.dataTransfer?.getData('text');
      const files = event.dataTransfer?.files;

      let hasImage = false;

      if (files) {
        for (const file of files) {
          if (file.type.startsWith('image/')) {
            hasImage = true;
            try {
              const base64 = await convertBlobToBase64(file);
              // Ensure we're storing the complete data URL with MIME type
              addToClipboard(base64);
            } catch (error) {
              console.error('Error converting image:', error);
              toast.error('Failed to process image');
            }
          }
        }
      }

      if (text && !hasImage) {
        addToClipboard(text);
      }
    };

    const handleDragOver = (event: DragEvent) => {
      event.preventDefault()
    }

    const handleDragEnter = (event: DragEvent) => {
      event.preventDefault()
    }

    ref.current?.addEventListener('paste', handlePaste)
    ref.current?.addEventListener('drop', handleDrop)
    ref.current?.addEventListener('dragover', handleDragOver)
    ref.current?.addEventListener('dragenter', handleDragEnter)

    return () => {
      ref.current?.removeEventListener('paste', handlePaste)
      ref.current?.removeEventListener('drop', handleDrop)
      ref.current?.removeEventListener('dragover', handleDragOver)
      ref.current?.removeEventListener('dragenter', handleDragEnter)
    }
  }, [])

  return (
    <div ref={ref} className="flex flex-col justify-center items-center gap-4 h-full">
      {
        clipboard.length === 0 ? (
          <div className="flex flex-col justify-center items-center gap-4 h-full text-neutral-500">
            <LucideClipboard size={64} />
            <p className="text-lg text-center">Clipboard is empty</p>
            <p className="text-xs flex-shrink-0 text-neutral-500 text-center">Add content by pasting or dropping items here</p>
          </div>
        ) : (
            <div className="flex flex-col gap-4 flex-grow overflow-y-auto mb-4">
              {clipboard.map((item, index) => (
                <div key={index} className="clipboard-item group flex gap-2 justify-center items-center border border-dashed rounded-lg p-4 transition-colors">
                  <div 
                    className="flex-grow cursor-pointer" 
                    onClick={() => handleCopyToClipboard(String(item))}
                  >
                    {typeof item === 'string' && !isBase64Image(item) ? (
                      <p className="break-all">{item}</p>
                    ) : (
                      <img src={String(item)} alt="Clipboard item" className="max-w-full h-auto" />
                    )}
                  </div>
                  <Button isIconOnly size="sm" onClick={() => removeFromClipboard(index)} className="self-start">
                    <LucideTrash2 size={16} />
                  </Button>
                </div>
              ))}

              <p className="text-xs flex-shrink-0 text-neutral-500 text-center">Add content by pasting or dropping items here</p>
            </div>
        )
    }
    </div>
  )
}

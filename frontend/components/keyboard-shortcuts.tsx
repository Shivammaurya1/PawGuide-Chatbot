"use client"

import { useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

interface KeyboardShortcutsProps {
  onClearChat: () => void
  onSaveChat: () => void
  onExportChat: () => void
  onToggleTheme: () => void
  onToggleSidebar: () => void
  messagesExist: boolean
}

export default function KeyboardShortcuts({
  onClearChat,
  onSaveChat,
  onExportChat,
  onToggleTheme,
  onToggleSidebar,
  messagesExist,
}: KeyboardShortcutsProps) {
  const { toast } = useToast()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if not in an input field or textarea
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") {
        return
      }

      // Ctrl/Cmd + / to show shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault()
        toast({
          title: "Keyboard Shortcuts",
          description: `
            Ctrl+K: Toggle sidebar
            Ctrl+L: Clear chat
            Ctrl+S: Save chat
            Ctrl+E: Export chat
            Ctrl+D: Toggle dark/light mode
            Ctrl+/: Show this help
          `,
        })
      }

      // Ctrl/Cmd + K to toggle sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        onToggleSidebar()
      }

      // Ctrl/Cmd + L to clear chat
      if ((e.ctrlKey || e.metaKey) && e.key === "l" && messagesExist) {
        e.preventDefault()
        onClearChat()
      }

      // Ctrl/Cmd + S to save chat
      if ((e.ctrlKey || e.metaKey) && e.key === "s" && messagesExist) {
        e.preventDefault()
        onSaveChat()
      }

      // Ctrl/Cmd + E to export chat
      if ((e.ctrlKey || e.metaKey) && e.key === "e" && messagesExist) {
        e.preventDefault()
        onExportChat()
      }

      // Ctrl/Cmd + D to toggle theme
      if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault()
        onToggleTheme()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onClearChat, onSaveChat, onExportChat, onToggleTheme, onToggleSidebar, messagesExist, toast])

  return null
}


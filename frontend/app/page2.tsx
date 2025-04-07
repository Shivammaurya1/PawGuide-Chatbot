"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import {
  Send,
  PawPrintIcon,
  Loader2,
  Cat,
  Dog,
  Fish,
  Bird,
  Rabbit,
  AlertCircle,
  Trash2,
  Clock,
  Download,
  Sun,
  Moon,
  Menu,
  BookmarkPlus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { useToast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"
import ChatSidebar from "@/components/chat-sidebar"
import { PetThemeProvider, usePetTheme } from "@/components/pet-theme-provider"

// Fix the imports for markdown processing
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm" // Fixed import
import rehypeRaw from "rehype-raw"
import rehypeSanitize from "rehype-sanitize"

const petIcons = [
  { icon: Cat, color: "text-purple-400", name: "Cat", themeColor: "purple" },
  { icon: Dog, color: "text-amber-400", name: "Dog", themeColor: "amber" },
  { icon: Fish, color: "text-blue-400", name: "Fish", themeColor: "blue" },
  { icon: Bird, color: "text-emerald-400", name: "Bird", themeColor: "emerald" },
  { icon: Rabbit, color: "text-pink-400", name: "Rabbit", themeColor: "pink" },
  { icon: PawPrintIcon, color: "text-indigo-400", name: "Paw", themeColor: "indigo" },
]

// Define message type
interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  isTyping?: boolean
  keywords?: string[]
}

// Define knowledge card type
interface KnowledgeCardType {
  id: string
  title: string
  content: string
  petType: string
  timestamp: Date
  tags: string[]
}

// Define pet profile type
interface PetProfileType {
  id: string
  name: string
  type: string
  breed: string
  age: string
  weight: string
  notes: string
  avatar?: string
}

// Define chat history type
interface ChatHistory {
  id: string
  title: string
  preview: string
  timestamp: Date
  messages: Message[]
  petContext?: string
}

export default function PetChatbotWrapper() {
  return (
    <PetThemeProvider>
      <PetChatbot />
    </PetThemeProvider>
  )
}

function PetChatbot() {
  // Client-side only state
  const [mounted, setMounted] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [selectedPet, setSelectedPet] = useState(0)
  const { theme, setTheme } = useTheme()
  const { petTheme, setPetTheme } = usePetTheme()
  const [typingText, setTypingText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showTimestamps, setShowTimestamps] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [knowledgeCards, setKnowledgeCards] = useState<KnowledgeCardType[]>([])
  const [petProfiles, setPetProfiles] = useState<PetProfileType[]>([])
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([])
  const [activePet, setActivePet] = useState<PetProfileType | null>(null)
  const [activeTab, setActiveTab] = useState("chat")
  const [selectedChatHistory, setSelectedChatHistory] = useState<string | null>(null)
  const [filterKeyword, setFilterKeyword] = useState("")
  const { toast } = useToast()
  const isMobile = useMobile()

  // Handle mounting - this prevents hydration errors
  useEffect(() => {
    setMounted(true)
    // Set dark theme on component mount
    setTheme("dark")

    // Load data from localStorage
    const loadLocalData = () => {
      try {
        const storedCards = localStorage.getItem("pawguide-knowledge-cards")
        if (storedCards) {
          setKnowledgeCards(
            JSON.parse(storedCards).map((card: any) => ({
              ...card,
              timestamp: new Date(card.timestamp),
            })),
          )
        }

        const storedPets = localStorage.getItem("pawguide-pet-profiles")
        if (storedPets) {
          setPetProfiles(JSON.parse(storedPets))
        }

        const storedHistory = localStorage.getItem("pawguide-chat-histories")
        if (storedHistory) {
          setChatHistories(
            JSON.parse(storedHistory).map((history: any) => ({
              ...history,
              timestamp: new Date(history.timestamp),
              messages: history.messages.map((msg: any) => ({
                ...msg,
                timestamp: new Date(msg.timestamp),
              })),
            })),
          )
        }
      } catch (err) {
        console.error("Error loading local data:", err)
      }
    }

    loadLocalData()
  }, [setTheme])

  // Save data to localStorage when it changes
  useEffect(() => {
    if (!mounted) return

    try {
      localStorage.setItem("pawguide-knowledge-cards", JSON.stringify(knowledgeCards))
      localStorage.setItem("pawguide-pet-profiles", JSON.stringify(petProfiles))
      localStorage.setItem("pawguide-chat-histories", JSON.stringify(chatHistories))
    } catch (err) {
      console.error("Error saving to localStorage:", err)
    }
  }, [knowledgeCards, petProfiles, chatHistories, mounted])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, typingText])

  // Update pet theme when selected pet changes
  useEffect(() => {
    setPetTheme(petIcons[selectedPet].themeColor)
  }, [selectedPet, setPetTheme])

  const PetIcon = petIcons[selectedPet].icon
  const petColor = petIcons[selectedPet].color

  // Save current chat as history
  const saveChat = () => {
    if (messages.length === 0) return

    const userMessages = messages.filter((m) => m.role === "user")
    const title =
      userMessages.length > 0
        ? userMessages[0].content.substring(0, 30) + (userMessages[0].content.length > 30 ? "..." : "")
        : "Chat " + new Date().toLocaleDateString()

    const newHistory: ChatHistory = {
      id: Date.now().toString(),
      title,
      preview: messages[messages.length - 1].content.substring(0, 50) + "...",
      timestamp: new Date(),
      messages: [...messages],
      petContext: activePet ? activePet.name : undefined,
    }

    setChatHistories((prev) => [newHistory, ...prev])
    toast({
      title: "Chat saved",
      description: "Your conversation has been saved to history.",
    })
  }

  // Load a chat history
  const loadChatHistory = (historyId: string) => {
    const history = chatHistories.find((h) => h.id === historyId)
    if (!history) return

    setMessages(history.messages)
    setSelectedChatHistory(historyId)

    // If there's a pet context, set it as active
    if (history.petContext) {
      const pet = petProfiles.find((p) => p.name === history.petContext)
      if (pet) {
        setActivePet(pet)
      }
    }

    if (isMobile) {
      setSidebarOpen(false)
    }

    toast({
      title: "Chat loaded",
      description: "Previous conversation has been loaded.",
    })
  }

  // Clear chat history
  const clearChat = () => {
    setMessages([])
    setError(null)
    setIsTyping(false)
    setTypingText("")
    setSelectedChatHistory(null)
  }

  // Export chat history
  const exportChat = () => {
    if (typeof window === "undefined" || messages.length === 0) return

    const chatHistory = messages
      .map((msg) => {
        return `[${format(msg.timestamp, "yyyy-MM-dd HH:mm:ss")}] ${msg.role === "user" ? "You" : "PawGuide"}: ${msg.content}`
      })
      .join("\n\n")

    const blob = new Blob([chatHistory], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `pawguide-chat-${format(new Date(), "yyyy-MM-dd")}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Toggle theme
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  // Create a knowledge card from a message
  const createKnowledgeCard = (message: Message, title: string) => {
    const newCard: KnowledgeCardType = {
      id: Date.now().toString(),
      title,
      content: message.content,
      petType: petIcons[selectedPet].name,
      timestamp: new Date(),
      tags: message.keywords || [petIcons[selectedPet].name.toLowerCase()],
    }

    setKnowledgeCards((prev) => [newCard, ...prev])
    toast({
      title: "Knowledge saved",
      description: "The information has been saved as a knowledge card.",
    })
  }

  // Add a pet profile
  const addPetProfile = (pet: Omit<PetProfileType, "id">) => {
    const newPet: PetProfileType = {
      ...pet,
      id: Date.now().toString(),
    }

    setPetProfiles((prev) => [newPet, ...prev])
    toast({
      title: "Pet added",
      description: `${pet.name} has been added to your pets.`,
    })
  }

  // Set active pet for context
  const setActivePetProfile = (petId: string | null) => {
    if (!petId) {
      setActivePet(null)
      toast({
        title: "Pet context removed",
        description: "Conversations will no longer include pet context.",
      })
      return
    }

    const pet = petProfiles.find((p) => p.id === petId)
    if (pet) {
      setActivePet(pet)
      toast({
        title: "Pet context set",
        description: `Conversations will now include context about ${pet.name}.`,
      })
    }
  }

  // Extract keywords from text
  const extractKeywords = (text: string): string[] => {
    const petKeywords = ["dog", "cat", "fish", "bird", "rabbit", "pet", "animal"]
    const careKeywords = ["food", "health", "training", "behavior", "grooming", "toys", "treats"]
    const allKeywords = [...petKeywords, ...careKeywords]

    return allKeywords.filter((keyword) => text.toLowerCase().includes(keyword))
  }

  // Simulate typing effect with markdown preservation
  const simulateTyping = (text: string) => {
    setIsTyping(true)
    setTypingText("")

    // For markdown, we'll type faster and in chunks to preserve formatting
    const chunks = splitIntoChunks(text, 3)
    let currentChunk = 0

    const typingInterval = setInterval(() => {
      if (currentChunk < chunks.length) {
        setTypingText((prev) => prev + chunks[currentChunk])
        currentChunk++
      } else {
        clearInterval(typingInterval)
        setIsTyping(false)

        // Add the complete message to the chat with extracted keywords
        setMessages((prev) => {
          const newMessages = [...prev]
          const lastIndex = newMessages.length - 1
          if (lastIndex >= 0 && newMessages[lastIndex].isTyping) {
            newMessages[lastIndex] = {
              ...newMessages[lastIndex],
              content: text,
              isTyping: false,
              keywords: extractKeywords(text),
            }
          }
          return newMessages
        })
      }
    }, 30) // Slightly faster typing for chunks
  }

  // Helper function to split text into chunks while preserving markdown
  const splitIntoChunks = (text: string, chunkSize: number): string[] => {
    const chunks: string[] = []

    // Special markdown patterns to keep together
    const markdownPatterns = [
      /^#+\s.*$/m, // Headers
      /^\s*[-*+]\s.*$/m, // List items
      /^\s*\d+\.\s.*$/m, // Numbered list items
      /^>\s.*$/m, // Blockquotes
      /^```[\s\S]*?```$/m, // Code blocks
      /^\|[\s\S]*?\|$/m, // Table rows
      /^---$/m, // Horizontal rules
    ]

    let currentPosition = 0

    while (currentPosition < text.length) {
      // Check if current position starts a markdown pattern
      let patternMatch = false
      let patternLength = 0

      for (const pattern of markdownPatterns) {
        const remainingText = text.slice(currentPosition)
        const match = remainingText.match(pattern)

        if (match && match.index === 0) {
          patternMatch = true
          patternLength = match[0].length
          break
        }
      }

      if (patternMatch) {
        // Add the entire markdown pattern as a chunk
        chunks.push(text.slice(currentPosition, currentPosition + patternLength))
        currentPosition += patternLength
      } else {
        // Add a regular chunk
        const endPosition = Math.min(currentPosition + chunkSize, text.length)
        chunks.push(text.slice(currentPosition, endPosition))
        currentPosition = endPosition
      }
    }

    return chunks
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || isLoading) return

    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
      keywords: extractKeywords(input),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setError(null)

    // Add a placeholder for the typing animation
    const typingPlaceholder: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isTyping: true,
    }

    setMessages((prev) => [...prev, typingPlaceholder])

    try {
      // Format messages for the API (excluding the typing placeholder)
      const apiMessages = [...messages, userMessage]
        .filter((msg) => !msg.isTyping)
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }))

      // Prepare pet context if available
      const petContext = activePet
        ? {
            name: activePet.name,
            type: activePet.type,
            breed: activePet.breed,
            age: activePet.age,
            notes: activePet.notes,
          }
        : null

      // Try to call the main API
      let response
      try {
        response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: apiMessages,
            petContext,
          }),
          cache: "no-store",
        })
      } catch (fetchError) {
        console.log("Main API failed, trying fallback:", fetchError)
        // If the main API fails, try the mock API
        response = await fetch("/api/mock/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: apiMessages,
            petContext,
          }),
          cache: "no-store",
        })
      }

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()

      // Simulate typing for the response
      simulateTyping(data.text)
    } catch (err) {
      console.error("Error:", err)

      // Remove the typing placeholder
      setMessages((prev) => prev.filter((msg) => !msg.isTyping))

      // Add an error message from the assistant
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content:
          "I'm having trouble connecting right now. Please check your internet connection and try again in a moment.",
        timestamp: new Date(),
        keywords: ["error"],
      }

      setMessages((prev) => [...prev, errorMessage])
      setError("Failed to connect to the pet assistant. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  // Function to cycle through pet icons
  const cycleIcon = () => {
    setSelectedPet((prev) => (prev + 1) % petIcons.length)
  }

  // Return a loading state or nothing during server-side rendering
  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  // Get theme-specific colors
  const getThemeColors = () => {
    const baseColors = {
      purple: {
        primary: theme === "dark" ? "text-purple-300" : "text-purple-700",
        bg: theme === "dark" ? "bg-purple-900 bg-opacity-70" : "bg-purple-100",
        border: theme === "dark" ? "border-purple-800" : "border-purple-200",
        hover: theme === "dark" ? "hover:bg-purple-800" : "hover:bg-purple-200",
        button: theme === "dark" ? "bg-purple-700 hover:bg-purple-600" : "bg-purple-500 hover:bg-purple-600",
      },
      amber: {
        primary: theme === "dark" ? "text-amber-300" : "text-amber-700",
        bg: theme === "dark" ? "bg-amber-900 bg-opacity-70" : "bg-amber-100",
        border: theme === "dark" ? "border-amber-800" : "border-amber-200",
        hover: theme === "dark" ? "hover:bg-amber-800" : "hover:bg-amber-200",
        button: theme === "dark" ? "bg-amber-700 hover:bg-amber-600" : "bg-amber-500 hover:bg-amber-600",
      },
      blue: {
        primary: theme === "dark" ? "text-blue-300" : "text-blue-700",
        bg: theme === "dark" ? "bg-blue-900 bg-opacity-70" : "bg-blue-100",
        border: theme === "dark" ? "border-blue-800" : "border-blue-200",
        hover: theme === "dark" ? "hover:bg-blue-800" : "hover:bg-blue-200",
        button: theme === "dark" ? "bg-blue-700 hover:bg-blue-600" : "bg-blue-500 hover:bg-blue-600",
      },
      emerald: {
        primary: theme === "dark" ? "text-emerald-300" : "text-emerald-700",
        bg: theme === "dark" ? "bg-emerald-900 bg-opacity-70" : "bg-emerald-100",
        border: theme === "dark" ? "border-emerald-800" : "border-emerald-200",
        hover: theme === "dark" ? "hover:bg-emerald-800" : "hover:bg-emerald-200",
        button: theme === "dark" ? "bg-emerald-700 hover:bg-emerald-600" : "bg-emerald-500 hover:bg-emerald-600",
      },
      pink: {
        primary: theme === "dark" ? "text-pink-300" : "text-pink-700",
        bg: theme === "dark" ? "bg-pink-900 bg-opacity-70" : "bg-pink-100",
        border: theme === "dark" ? "border-pink-800" : "border-pink-200",
        hover: theme === "dark" ? "hover:bg-pink-800" : "hover:bg-pink-200",
        button: theme === "dark" ? "bg-pink-700 hover:bg-pink-600" : "bg-pink-500 hover:bg-pink-600",
      },
      indigo: {
        primary: theme === "dark" ? "text-indigo-300" : "text-indigo-700",
        bg: theme === "dark" ? "bg-indigo-900 bg-opacity-70" : "bg-indigo-100",
        border: theme === "dark" ? "border-indigo-800" : "border-indigo-200",
        hover: theme === "dark" ? "hover:bg-indigo-800" : "hover:bg-indigo-200",
        button: theme === "dark" ? "bg-indigo-700 hover:bg-indigo-600" : "bg-indigo-500 hover:bg-indigo-600",
      },
    }

    return baseColors[petTheme as keyof typeof baseColors]
  }

  const colors = getThemeColors()

  return (
    <div
      className={cn(
        "flex min-h-screen",
        theme === "dark"
          ? "bg-gradient-to-b from-gray-900 to-gray-950 text-gray-100"
          : "bg-gradient-to-b from-gray-50 to-white text-gray-800",
      )}
    >
      {/* Sidebar for larger screens */}
      {!isMobile && (
        <ChatSidebar
          open={sidebarOpen}
          setOpen={setSidebarOpen}
          chatHistories={chatHistories}
          knowledgeCards={knowledgeCards}
          petProfiles={petProfiles}
          activePet={activePet}
          setActivePet={setActivePetProfile}
          loadChatHistory={loadChatHistory}
          selectedChatHistory={selectedChatHistory}
          filterKeyword={filterKeyword}
          setFilterKeyword={setFilterKeyword}
          addPetProfile={addPetProfile}
          theme={theme}
          petTheme={petTheme}
          colors={colors}
        />
      )}

      {/* Mobile sidebar */}
      {isMobile && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
            <ChatSidebar
              open={sidebarOpen}
              setOpen={setSidebarOpen}
              chatHistories={chatHistories}
              knowledgeCards={knowledgeCards}
              petProfiles={petProfiles}
              activePet={activePet}
              setActivePet={setActivePetProfile}
              loadChatHistory={loadChatHistory}
              selectedChatHistory={selectedChatHistory}
              filterKeyword={filterKeyword}
              setFilterKeyword={setFilterKeyword}
              addPetProfile={addPetProfile}
              theme={theme}
              petTheme={petTheme}
              colors={colors}
              isMobile={true}
            />
          </SheetContent>
        </Sheet>
      )}

      <div className="flex flex-col flex-1">
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className={cn(
            "sticky top-0 z-10 border-b shadow-lg",
            theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
          )}
        >
          <div className="container flex items-center h-16 px-4 mx-auto max-w-4xl">
            {/* Sidebar toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={theme === "dark" ? "text-gray-300" : "text-gray-700"}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <motion.div
              whileHover={{ rotate: 20 }}
              whileTap={{ scale: 0.9 }}
              onClick={cycleIcon}
              className="cursor-pointer ml-2"
            >
              <PetIcon className={`w-8 h-8 mr-3 ${petColor}`} />
            </motion.div>

            <h1 className={cn("text-xl font-bold", colors.primary)}>PawGuide Assistant</h1>

            {/* Active pet badge */}
            {activePet && (
              <Badge variant="outline" className={cn("ml-2", colors.border, colors.primary)}>
                {activePet.name} ({activePet.type})
              </Badge>
            )}

            <div className="flex-1"></div>

            <div className="flex items-center space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleTheme}
                      className={theme === "dark" ? "text-gray-300" : "text-gray-700"}
                    >
                      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Toggle theme</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowTimestamps(!showTimestamps)}
                      className={theme === "dark" ? "text-gray-300" : "text-gray-700"}
                    >
                      <Clock className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Toggle timestamps</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <DropdownMenu>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={theme === "dark" ? "text-gray-300" : "text-gray-700"}
                        >
                          <PetIcon className={`h-5 w-5 ${petColor}`} />
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Change assistant</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <DropdownMenuContent
                  align="end"
                  className={theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}
                >
                  {petIcons.map((pet, index) => (
                    <DropdownMenuItem
                      key={index}
                      onClick={() => setSelectedPet(index)}
                      className={cn(
                        "cursor-pointer flex items-center gap-2",
                        selectedPet === index && (theme === "dark" ? "bg-gray-700" : "bg-gray-100"),
                      )}
                    >
                      <pet.icon className={`w-5 h-5 ${pet.color}`} />
                      <span>{pet.name} Assistant</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={saveChat}
                      disabled={messages.length === 0}
                      className={theme === "dark" ? "text-gray-300" : "text-gray-700"}
                    >
                      <BookmarkPlus className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Save chat</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={exportChat}
                      disabled={messages.length === 0}
                      className={theme === "dark" ? "text-gray-300" : "text-gray-700"}
                    >
                      <Download className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Export chat</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={clearChat}
                      disabled={messages.length === 0}
                      className={
                        theme === "dark" ? "text-gray-300 hover:text-red-400" : "text-gray-700 hover:text-red-600"
                      }
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Clear chat</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </motion.header>

        <main className="flex-1 container max-w-4xl mx-auto p-4 overflow-hidden flex flex-col">
          {error && (
            <Alert
              variant="destructive"
              className={cn("mb-4", theme === "dark" ? "bg-red-900 border-red-800" : "bg-red-100 border-red-200")}
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
            <AnimatePresence>
              {messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center justify-center h-[60vh] text-center p-8 space-y-6"
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: "reverse",
                    }}
                    className={theme === "dark" ? "bg-gray-800 p-6 rounded-full" : "bg-gray-100 p-6 rounded-full"}
                  >
                    <PetIcon className={`w-16 h-16 ${petColor}`} />
                  </motion.div>
                  <h2 className={cn("text-2xl font-semibold", colors.primary)}>Welcome to PawGuide!</h2>
                  <p className={theme === "dark" ? "text-gray-400 max-w-md" : "text-gray-600 max-w-md"}>
                    Ask me anything about pet care, behavior, training, nutrition, or health concerns.
                  </p>

                  {petProfiles.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm mb-2">Select a pet for personalized advice:</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {petProfiles.map((pet) => (
                          <Badge
                            key={pet.id}
                            variant={activePet?.id === pet.id ? "default" : "outline"}
                            className={cn(
                              "cursor-pointer px-3 py-1",
                              activePet?.id === pet.id ? colors.button : colors.border,
                            )}
                            onClick={() => setActivePetProfile(pet.id)}
                          >
                            {pet.name} ({pet.type})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {[
                      "How do I train my puppy?",
                      "What should I feed my cat?",
                      "Why is my bird losing feathers?",
                      "Best toys for rabbits?",
                    ].map((suggestion, i) => (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        className={cn(
                          "px-4 py-2 rounded-lg text-sm text-left",
                          theme === "dark"
                            ? "bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700"
                            : "bg-white text-gray-700 hover:text-gray-900 hover:bg-gray-50 border border-gray-200",
                        )}
                        onClick={() => {
                          setInput(suggestion)
                          setTimeout(() => {
                            const event = new Event("submit") as any
                            handleSubmit(event)
                          }, 100)
                        }}
                      >
                        {suggestion}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={cn("flex items-start gap-3 max-w-[85%]", message.role === "user" ? "ml-auto" : "")}
                  >
                    {message.role !== "user" && (
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Avatar
                          className={cn("mt-1 border-2", theme === "dark" ? "border-gray-700" : "border-gray-200")}
                        >
                          <AvatarFallback className={theme === "dark" ? "bg-gray-800" : "bg-gray-100"}>
                            <PetIcon className={`w-5 h-5 ${petColor}`} />
                          </AvatarFallback>
                        </Avatar>
                      </motion.div>
                    )}
                    <div className="flex flex-col">
                      {showTimestamps && (
                        <span className={cn("text-xs mb-1", theme === "dark" ? "text-gray-500" : "text-gray-500")}>
                          {format(message.timestamp, "h:mm a")}
                        </span>
                      )}
                      <div className="flex flex-col">
                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          className={cn(
                            "rounded-lg px-4 py-2 relative group",
                            message.role === "user"
                              ? theme === "dark"
                                ? "bg-gray-800 text-gray-100 border border-gray-700"
                                : "bg-gray-100 text-gray-800 border border-gray-200"
                              : theme === "dark"
                                ? cn(colors.bg, "text-gray-100", colors.border)
                                : cn(colors.bg, "text-gray-800", colors.border),
                            message.role === "assistant" && "markdown-content",
                          )}
                        >
                          {message.isTyping && message.role === "assistant" ? (
                            typingText || (
                              <motion.div
                                animate={{
                                  opacity: [0.5, 1, 0.5],
                                }}
                                transition={{
                                  duration: 1.5,
                                  repeat: Number.POSITIVE_INFINITY,
                                }}
                                className="flex space-x-1"
                              >
                                <div className="w-2 h-2 rounded-full bg-current"></div>
                                <div className="w-2 h-2 rounded-full bg-current"></div>
                                <div className="w-2 h-2 rounded-full bg-current"></div>
                              </motion.div>
                            )
                          ) : message.role === "assistant" ? (
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              rehypePlugins={[rehypeRaw, rehypeSanitize]}
                              className="prose prose-sm dark:prose-invert max-w-none"
                              components={{
                                a: ({ node, ...props }) => (
                                  <a
                                    {...props}
                                    className="text-blue-500 hover:underline"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  />
                                ),
                                ul: ({ node, ...props }) => <ul {...props} className="list-disc pl-5 my-2" />,
                                ol: ({ node, ...props }) => <ol {...props} className="list-decimal pl-5 my-2" />,
                                li: ({ node, ...props }) => <li {...props} className="my-1" />,
                                h1: ({ node, ...props }) => <h1 {...props} className="text-xl font-bold my-3" />,
                                h2: ({ node, ...props }) => <h2 {...props} className="text-lg font-bold my-2" />,
                                h3: ({ node, ...props }) => <h3 {...props} className="text-md font-bold my-2" />,
                                p: ({ node, ...props }) => <p {...props} className="my-2" />,
                                code: ({ node, inline, ...props }) =>
                                  inline ? (
                                    <code
                                      {...props}
                                      className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-sm"
                                    />
                                  ) : (
                                    <code
                                      {...props}
                                      className="block bg-gray-200 dark:bg-gray-700 p-2 rounded text-sm overflow-x-auto my-2"
                                    />
                                  ),
                                pre: ({ node, ...props }) => (
                                  <pre
                                    {...props}
                                    className="bg-gray-200 dark:bg-gray-700 p-2 rounded overflow-x-auto my-2"
                                  />
                                ),
                                blockquote: ({ node, ...props }) => (
                                  <blockquote {...props} className={`border-l-4 pl-4 italic my-2 ${colors.border}`} />
                                ),
                                hr: ({ node, ...props }) => (
                                  <hr {...props} className="my-4 border-gray-300 dark:border-gray-700" />
                                ),
                                table: ({ node, ...props }) => (
                                  <table {...props} className="border-collapse table-auto w-full my-2" />
                                ),
                                th: ({ node, ...props }) => (
                                  <th
                                    {...props}
                                    className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left"
                                  />
                                ),
                                td: ({ node, ...props }) => (
                                  <td {...props} className="border border-gray-300 dark:border-gray-700 px-4 py-2" />
                                ),
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          ) : (
                            message.content
                          )}

                          {/* Save as knowledge card button for assistant messages */}
                          {message.role === "assistant" && !message.isTyping && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="absolute -right-2 -top-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <BookmarkPlus className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Save as Knowledge Card</DialogTitle>
                                  <DialogDescription>
                                    Create a knowledge card from this information for future reference.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="grid gap-2">
                                    <Label htmlFor="card-title">Title</Label>
                                    <Input
                                      id="card-title"
                                      placeholder="e.g., How to brush your dog's teeth"
                                      className="col-span-3"
                                      defaultValue={message.keywords?.length ? `Tips about ${message.keywords[0]}` : ""}
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="card-content">Content</Label>
                                    <Textarea
                                      id="card-content"
                                      className="col-span-3 h-24"
                                      defaultValue={message.content}
                                      readOnly
                                    />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button
                                    type="submit"
                                    className={colors.button}
                                    onClick={() => {
                                      const titleInput = document.getElementById("card-title") as HTMLInputElement
                                      createKnowledgeCard(message, titleInput.value)
                                    }}
                                  >
                                    Save Card
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          )}
                        </motion.div>

                        {/* Display keywords as badges */}
                        {message.keywords && message.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {message.keywords.map((keyword, i) => (
                              <Badge key={i} variant="outline" className={cn("text-xs", colors.border, colors.primary)}>
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    {message.role === "user" && (
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Avatar
                          className={cn("mt-1 border-2", theme === "dark" ? "border-gray-700" : "border-gray-200")}
                        >
                          <AvatarFallback
                            className={theme === "dark" ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-800"}
                          >
                            U
                          </AvatarFallback>
                        </Avatar>
                      </motion.div>
                    )}
                  </motion.div>
                ))
              )}
            </AnimatePresence>
            {isLoading && !isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3"
              >
                <Avatar className={cn("mt-1 border-2", theme === "dark" ? "border-gray-700" : "border-gray-200")}>
                  <AvatarFallback className={theme === "dark" ? "bg-gray-800" : "bg-gray-100"}>
                    <PetIcon className={`w-5 h-5 ${petColor}`} />
                  </AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    "rounded-lg px-4 py-2 border",
                    theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
                  )}
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                  >
                    <Loader2 className={`w-5 h-5 animate-spin ${petColor}`} />
                  </motion.div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <motion.form
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            onSubmit={handleSubmit}
            className={cn(
              "sticky bottom-0 rounded-lg border shadow-lg p-3 flex gap-2",
              theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
            )}
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your pet..."
              className={cn(
                "flex-1",
                theme === "dark"
                  ? "bg-gray-900 border-gray-700 text-gray-100 focus-visible:ring-purple-500"
                  : "bg-gray-50 border-gray-200 text-gray-800 focus-visible:ring-amber-500",
              )}
            />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button type="submit" size="icon" className={colors.button} disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </motion.div>
          </motion.form>
        </main>
      </div>
    </div>
  )
}


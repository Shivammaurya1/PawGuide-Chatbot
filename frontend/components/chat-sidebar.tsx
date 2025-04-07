"use client"

import { useState } from "react"
import { Search, MessageSquare, Bookmark, PlusCircle, Filter, X, Home } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface ChatSidebarProps {
  open: boolean
  setOpen: (open: boolean) => void
  chatHistories: any[]
  knowledgeCards: any[]
  petProfiles: any[]
  activePet: any | null
  setActivePet: (petId: string | null) => void
  loadChatHistory: (historyId: string) => void
  selectedChatHistory: string | null
  filterKeyword: string
  setFilterKeyword: (keyword: string) => void
  addPetProfile: (pet: any) => void
  theme: string
  petTheme: string
  colors: any
  isMobile?: boolean
}

export default function ChatSidebar({
  open,
  setOpen,
  chatHistories,
  knowledgeCards,
  petProfiles,
  activePet,
  setActivePet,
  loadChatHistory,
  selectedChatHistory,
  filterKeyword,
  setFilterKeyword,
  addPetProfile,
  theme,
  petTheme,
  colors,
  isMobile = false,
}: ChatSidebarProps) {
  const [activeTab, setActiveTab] = useState("chats")
  const [searchQuery, setSearchQuery] = useState("")
  const [newPet, setNewPet] = useState({
    name: "",
    type: "Dog",
    breed: "",
    age: "",
    weight: "",
    notes: "",
  })

  // Filter chat histories by keyword and search query
  const filteredChatHistories = chatHistories.filter((history) => {
    const matchesKeyword =
      !filterKeyword ||
      history.messages.some(
        (msg: any) =>
          msg.keywords?.includes(filterKeyword.toLowerCase()) ||
          msg.content.toLowerCase().includes(filterKeyword.toLowerCase()),
      )

    const matchesSearch =
      !searchQuery ||
      history.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      history.messages.some((msg: any) => msg.content.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesKeyword && matchesSearch
  })

  // Filter knowledge cards by keyword and search query
  const filteredKnowledgeCards = knowledgeCards.filter((card) => {
    const matchesKeyword =
      !filterKeyword ||
      card.tags.includes(filterKeyword.toLowerCase()) ||
      card.content.toLowerCase().includes(filterKeyword.toLowerCase())

    const matchesSearch =
      !searchQuery ||
      card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.content.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesKeyword && matchesSearch
  })

  // Handle new pet form submission
  const handleAddPet = () => {
    if (!newPet.name.trim()) return

    addPetProfile(newPet)

    // Reset form
    setNewPet({
      name: "",
      type: "Dog",
      breed: "",
      age: "",
      weight: "",
      notes: "",
    })
  }

  if (!open) return null

  return (
    <div
      className={cn(
        "h-screen flex flex-col border-r",
        theme === "dark" ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200",
        isMobile ? "w-full" : "w-80",
      )}
    >
      <div className="p-4 flex items-center justify-between border-b">
        <h2 className={cn("text-lg font-semibold", colors.primary)}>PawGuide</h2>
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <div className="p-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search..."
            className={cn("pl-8", theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="chats" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className={cn("grid grid-cols-3 mx-2", theme === "dark" ? "bg-gray-800" : "bg-gray-100")}>
          <TabsTrigger value="chats" className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Chats</span>
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="flex items-center gap-1">
            <Bookmark className="h-4 w-4" />
            <span className="hidden sm:inline">Knowledge</span>
          </TabsTrigger>
          <TabsTrigger value="pets" className="flex items-center gap-1">
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">My Pets</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chats" className="flex-1 flex flex-col">
          <div className="p-2 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 text-xs"
              onClick={() => setFilterKeyword("")}
            >
              <Filter className="h-3 w-3" />
              Filter
            </Button>

            {filterKeyword && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {filterKeyword}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterKeyword("")} />
              </Badge>
            )}
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2 space-y-2">
              {filteredChatHistories.length > 0 ? (
                filteredChatHistories.map((history) => (
                  <Card
                    key={history.id}
                    className={cn(
                      "cursor-pointer transition-colors",
                      selectedChatHistory === history.id
                        ? theme === "dark"
                          ? "bg-gray-800 border-gray-700"
                          : "bg-gray-100 border-gray-300"
                        : theme === "dark"
                          ? "bg-gray-900 border-gray-800 hover:bg-gray-800"
                          : "bg-white border-gray-200 hover:bg-gray-50",
                    )}
                    onClick={() => loadChatHistory(history.id)}
                  >
                    <CardHeader className="p-3 pb-1">
                      <CardTitle className="text-sm">{history.title}</CardTitle>
                      <CardDescription className="text-xs">
                        {format(new Date(history.timestamp), "MMM d, yyyy h:mm a")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <p className="text-xs truncate">{history.preview}</p>
                      {history.petContext && (
                        <Badge variant="outline" className={cn("mt-2 text-xs", colors.border, colors.primary)}>
                          {history.petContext}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className={cn("text-center p-4 rounded-lg", theme === "dark" ? "bg-gray-800" : "bg-gray-100")}>
                  <p className="text-sm text-gray-500">No chat history found</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="knowledge" className="flex-1 flex flex-col">
          <div className="p-2 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 text-xs"
              onClick={() => setFilterKeyword("")}
            >
              <Filter className="h-3 w-3" />
              Filter
            </Button>

            {filterKeyword && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {filterKeyword}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterKeyword("")} />
              </Badge>
            )}
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2 space-y-2">
              {filteredKnowledgeCards.length > 0 ? (
                filteredKnowledgeCards.map((card) => (
                  <Card
                    key={card.id}
                    className={cn(
                      theme === "dark"
                        ? "bg-gray-900 border-gray-800 hover:bg-gray-800"
                        : "bg-white border-gray-200 hover:bg-gray-50",
                    )}
                  >
                    <CardHeader className="p-3 pb-1">
                      <CardTitle className="text-sm">{card.title}</CardTitle>
                      <CardDescription className="text-xs flex items-center gap-1">
                        {card.petType}
                        <span>•</span>
                        {format(new Date(card.timestamp), "MMM d, yyyy")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <p className="text-xs line-clamp-3">{card.content}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {card.tags.map((tag: string, i: number) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className={cn("text-xs cursor-pointer", colors.border, colors.primary)}
                            onClick={() => setFilterKeyword(tag)}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className={cn("text-center p-4 rounded-lg", theme === "dark" ? "bg-gray-800" : "bg-gray-100")}>
                  <p className="text-sm text-gray-500">No knowledge cards found</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="pets" className="flex-1 flex flex-col">
          <div className="p-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full flex items-center gap-1">
                  <PlusCircle className="h-4 w-4" />
                  Add Pet
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add a New Pet</DialogTitle>
                  <DialogDescription>Add your pet's information to get personalized advice.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="pet-name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="pet-name"
                      value={newPet.name}
                      onChange={(e) => setNewPet({ ...newPet, name: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="pet-type" className="text-right">
                      Type
                    </Label>
                    <Select value={newPet.type} onValueChange={(value) => setNewPet({ ...newPet, type: value })}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select pet type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Dog">Dog</SelectItem>
                        <SelectItem value="Cat">Cat</SelectItem>
                        <SelectItem value="Bird">Bird</SelectItem>
                        <SelectItem value="Fish">Fish</SelectItem>
                        <SelectItem value="Rabbit">Rabbit</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="pet-breed" className="text-right">
                      Breed
                    </Label>
                    <Input
                      id="pet-breed"
                      value={newPet.breed}
                      onChange={(e) => setNewPet({ ...newPet, breed: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="pet-age" className="text-right">
                      Age
                    </Label>
                    <Input
                      id="pet-age"
                      value={newPet.age}
                      onChange={(e) => setNewPet({ ...newPet, age: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="pet-weight" className="text-right">
                      Weight
                    </Label>
                    <Input
                      id="pet-weight"
                      value={newPet.weight}
                      onChange={(e) => setNewPet({ ...newPet, weight: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="pet-notes" className="text-right">
                      Notes
                    </Label>
                    <Textarea
                      id="pet-notes"
                      value={newPet.notes}
                      onChange={(e) => setNewPet({ ...newPet, notes: e.target.value })}
                      className="col-span-3"
                      placeholder="Health conditions, special needs, etc."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handleAddPet}>
                    Add Pet
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Separator />

          <ScrollArea className="flex-1">
            <div className="p-2 space-y-2">
              <div className="mb-2">
                <h3 className={cn("text-sm font-medium mb-1", colors.primary)}>Active Pet Context</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={!activePet ? "default" : "outline"}
                    className={cn("cursor-pointer", !activePet ? colors.button : colors.border)}
                    onClick={() => setActivePet(null)}
                  >
                    None
                  </Badge>
                  {petProfiles.map((pet) => (
                    <Badge
                      key={pet.id}
                      variant={activePet?.id === pet.id ? "default" : "outline"}
                      className={cn("cursor-pointer", activePet?.id === pet.id ? colors.button : colors.border)}
                      onClick={() => setActivePet(pet.id)}
                    >
                      {pet.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-2 mt-2">
                <h3 className={cn("text-sm font-medium", colors.primary)}>My Pets</h3>
                {petProfiles.length > 0 ? (
                  petProfiles.map((pet) => (
                    <Card
                      key={pet.id}
                      className={cn(
                        "cursor-pointer transition-colors",
                        activePet?.id === pet.id
                          ? theme === "dark"
                            ? "bg-gray-800 border-gray-700"
                            : "bg-gray-100 border-gray-300"
                          : theme === "dark"
                            ? "bg-gray-900 border-gray-800 hover:bg-gray-800"
                            : "bg-white border-gray-200 hover:bg-gray-50",
                      )}
                      onClick={() => setActivePet(pet.id)}
                    >
                      <CardHeader className="p-3 pb-1">
                        <CardTitle className="text-sm">{pet.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {pet.type} • {pet.breed || "Unknown breed"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        {pet.age && <p className="text-xs">Age: {pet.age}</p>}
                        {pet.weight && <p className="text-xs">Weight: {pet.weight}</p>}
                        {pet.notes && <p className="text-xs mt-1 line-clamp-2">{pet.notes}</p>}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className={cn("text-center p-4 rounded-lg", theme === "dark" ? "bg-gray-800" : "bg-gray-100")}>
                    <p className="text-sm text-gray-500">No pets added yet</p>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}


"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Cat, Dog, Fish, Bird, Rabbit, PawPrint } from "lucide-react"

interface PetProfileProps {
  name: string
  type: string
  breed: string
  age: string
  weight: string
  notes: string
  avatar?: string
  isActive: boolean
  onSelect: () => void
  theme: string
  colors: any
}

export default function PetProfile({
  name,
  type,
  breed,
  age,
  weight,
  notes,
  avatar,
  isActive,
  onSelect,
  theme,
  colors,
}: PetProfileProps) {
  // Get pet icon
  const getPetIcon = () => {
    switch (type.toLowerCase()) {
      case "cat":
        return <Cat className="h-5 w-5 text-purple-400" />
      case "dog":
        return <Dog className="h-5 w-5 text-amber-400" />
      case "fish":
        return <Fish className="h-5 w-5 text-blue-400" />
      case "bird":
        return <Bird className="h-5 w-5 text-emerald-400" />
      case "rabbit":
        return <Rabbit className="h-5 w-5 text-pink-400" />
      default:
        return <PawPrint className="h-5 w-5 text-indigo-400" />
    }
  }

  return (
    <Card
      className={cn(
        "transition-all",
        isActive ? colors.bg : theme === "dark" ? "bg-gray-800" : "bg-white",
        theme === "dark" ? "border-gray-700" : "border-gray-200",
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <Avatar>
            {avatar ? <AvatarImage src={avatar} alt={name} /> : <AvatarFallback>{getPetIcon()}</AvatarFallback>}
          </Avatar>
          <div>
            <CardTitle className={cn(isActive && colors.primary)}>{name}</CardTitle>
            <CardDescription>
              {type} • {breed}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 text-sm mb-2">
          <div>Age: {age}</div>
          <div>Weight: {weight}</div>
        </div>
        {notes && <p className="text-sm">{notes}</p>}
        <Button
          variant={isActive ? "default" : "outline"}
          size="sm"
          className={cn("mt-3 w-full", isActive && colors.button)}
          onClick={onSelect}
        >
          {isActive ? "Active Context" : "Set as Context"}
        </Button>
      </CardContent>
    </Card>
  )
}


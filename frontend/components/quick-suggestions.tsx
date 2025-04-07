"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface QuickSuggestionsProps {
  onSelectSuggestion: (suggestion: string) => void
  lastUserMessage: string | null
  theme: string
  colors: any
}

export default function QuickSuggestions({
  onSelectSuggestion,
  lastUserMessage,
  theme,
  colors,
}: QuickSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])

  useEffect(() => {
    if (!lastUserMessage) return

    const lowerCaseMessage = lastUserMessage.toLowerCase()

    // Generate contextual follow-up questions based on the last message
    if (lowerCaseMessage.includes("dog") || lowerCaseMessage.includes("puppy")) {
      setSuggestions([
        "How often should I walk my dog?",
        "What are the best dog training techniques?",
        "Common health issues in dogs?",
      ])
    } else if (lowerCaseMessage.includes("cat") || lowerCaseMessage.includes("kitten")) {
      setSuggestions([
        "How to stop my cat from scratching furniture?",
        "Best cat food for indoor cats?",
        "How often should I clean the litter box?",
      ])
    } else if (lowerCaseMessage.includes("fish") || lowerCaseMessage.includes("aquarium")) {
      setSuggestions([
        "How often should I change aquarium water?",
        "Best fish for beginners?",
        "How to maintain proper pH levels?",
      ])
    } else if (lowerCaseMessage.includes("bird") || lowerCaseMessage.includes("parrot")) {
      setSuggestions(["How to teach my bird to talk?", "Best cage setup for birds?", "Signs of illness in pet birds?"])
    } else if (lowerCaseMessage.includes("food") || lowerCaseMessage.includes("feeding")) {
      setSuggestions([
        "How much food should I give my pet?",
        "Best feeding schedule for pets?",
        "Homemade pet food recipes?",
      ])
    } else if (lowerCaseMessage.includes("train") || lowerCaseMessage.includes("training")) {
      setSuggestions([
        "How long does pet training take?",
        "Training treats recommendations?",
        "How to stop bad behavior?",
      ])
    } else {
      // Default suggestions
      setSuggestions(["Tell me about pet nutrition", "Common pet health issues", "Pet grooming tips"])
    }
  }, [lastUserMessage])

  if (!suggestions.length) return null

  return (
    <div className="mt-2 mb-4">
      <p className={cn("text-xs mb-2", theme === "dark" ? "text-gray-400" : "text-gray-600")}>Follow-up questions:</p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "text-xs",
                theme === "dark" ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-50 hover:bg-gray-100",
                colors.border,
              )}
              onClick={() => onSelectSuggestion(suggestion)}
            >
              {suggestion}
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}


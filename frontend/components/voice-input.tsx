"use client"

import { useState, useEffect } from "react"
import { Mic, MicOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface VoiceInputProps {
  onTranscript: (text: string) => void
  isDisabled?: boolean
  theme: string
  colors: any
}

export default function VoiceInput({ onTranscript, isDisabled, theme, colors }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [recognition, setRecognition] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognitionInstance = new SpeechRecognition()

      recognitionInstance.continuous = false
      recognitionInstance.interimResults = false
      recognitionInstance.lang = "en-US"

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        onTranscript(transcript)
        setIsListening(false)
        setIsProcessing(false)
      }

      recognitionInstance.onerror = (event: any) => {
        console.error("Speech recognition error", event.error)
        setIsListening(false)
        setIsProcessing(false)
        toast({
          title: "Voice input error",
          description: "There was a problem with voice recognition. Please try again.",
          variant: "destructive",
        })
      }

      recognitionInstance.onend = () => {
        setIsListening(false)
      }

      setRecognition(recognitionInstance)
    }

    return () => {
      if (recognition) {
        recognition.abort()
      }
    }
  }, [onTranscript, toast])

  const toggleListening = () => {
    if (!recognition) {
      toast({
        title: "Voice input not supported",
        description: "Your browser doesn't support voice input. Please type your message instead.",
        variant: "destructive",
      })
      return
    }

    if (isListening) {
      recognition.stop()
      setIsListening(false)
    } else {
      setIsProcessing(true)
      try {
        recognition.start()
        setIsListening(true)
        toast({
          title: "Listening...",
          description: "Speak now. Voice input will automatically stop after you pause.",
        })
      } catch (error) {
        console.error("Error starting speech recognition:", error)
        setIsProcessing(false)
        toast({
          title: "Voice input error",
          description: "There was a problem starting voice recognition. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <Button
      type="button"
      size="icon"
      variant={isListening ? "default" : "outline"}
      onClick={toggleListening}
      disabled={isDisabled}
      className={cn(isListening && colors.button, isListening && "animate-pulse")}
      aria-label={isListening ? "Stop voice input" : "Start voice input"}
    >
      {isProcessing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isListening ? (
        <MicOff className="h-4 w-4" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </Button>
  )
}


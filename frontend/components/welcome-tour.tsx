"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ArrowRight, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

interface WelcomeTourProps {
  onComplete: () => void
}

export default function WelcomeTour({ onComplete }: WelcomeTourProps) {
  const [step, setStep] = useState(0)
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const steps = [
    {
      title: "Welcome to PawGuide!",
      description: "Your AI-powered pet care assistant. Let's take a quick tour to help you get started.",
      icon: <Info className="h-8 w-8 text-blue-500" />,
    },
    {
      title: "Ask Anything",
      description: "Ask questions about pet care, behavior, training, nutrition, or health concerns.",
      icon: <Info className="h-8 w-8 text-green-500" />,
    },
    {
      title: "Save Knowledge",
      description: "Save useful information as knowledge cards for quick reference later.",
      icon: <Info className="h-8 w-8 text-amber-500" />,
    },
    {
      title: "Add Your Pets",
      description: "Add your pets' profiles to get personalized advice tailored to their needs.",
      icon: <Info className="h-8 w-8 text-purple-500" />,
    },
  ]

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      onComplete()
      // Save to localStorage that the tour has been completed
      localStorage.setItem("pawguide-tour-completed", "true")
    }
  }

  const handleSkip = () => {
    onComplete()
    // Save to localStorage that the tour has been completed
    localStorage.setItem("pawguide-tour-completed", "true")
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          className={cn(
            "relative w-full max-w-md rounded-lg p-6 shadow-xl",
            theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-800",
          )}
        >
          <Button variant="ghost" size="icon" className="absolute right-2 top-2" onClick={handleSkip}>
            <X className="h-4 w-4" />
          </Button>

          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-opacity-10 bg-blue-500">
              {steps[step].icon}
            </div>
            <h3 className="mb-2 text-xl font-bold">{steps[step].title}</h3>
            <p className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>{steps[step].description}</p>

            <div className="mt-8 flex w-full items-center justify-between">
              <Button variant="ghost" onClick={handleSkip}>
                Skip Tour
              </Button>
              <div className="flex items-center space-x-2">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-2 w-2 rounded-full",
                      i === step ? "bg-blue-500" : theme === "dark" ? "bg-gray-600" : "bg-gray-300",
                    )}
                  />
                ))}
              </div>
              <Button onClick={handleNext}>
                {step < steps.length - 1 ? (
                  <>
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  "Get Started"
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}


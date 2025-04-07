"use client"

import { useState, useEffect } from "react"
import { ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface ScrollToTopProps {
  theme: string
  colors: any
}

export default function ScrollToTop({ theme, colors }: ScrollToTopProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", toggleVisibility)
    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="fixed bottom-24 right-4 z-50"
        >
          <Button
            size="icon"
            onClick={scrollToTop}
            className={cn(
              "rounded-full shadow-lg",
              theme === "dark" ? "bg-gray-800 hover:bg-gray-700" : "bg-white hover:bg-gray-100",
              colors.border,
            )}
            aria-label="Scroll to top"
          >
            <ArrowUp className={cn("h-5 w-5", colors.primary)} />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}


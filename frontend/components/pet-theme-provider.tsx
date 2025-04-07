"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type PetTheme = "purple" | "amber" | "blue" | "emerald" | "pink" | "indigo"

interface PetThemeContextType {
  petTheme: PetTheme
  setPetTheme: (theme: PetTheme) => void
}

const PetThemeContext = createContext<PetThemeContextType>({
  petTheme: "purple",
  setPetTheme: () => null,
})

export function PetThemeProvider({ children }: { children: ReactNode }) {
  const [petTheme, setPetTheme] = useState<PetTheme>("purple")

  return <PetThemeContext.Provider value={{ petTheme, setPetTheme }}>{children}</PetThemeContext.Provider>
}

export const usePetTheme = () => useContext(PetThemeContext)


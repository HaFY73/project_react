"use client"
import { createContext, useContext, useState } from "react"

const ProfileDialogContext = createContext<{
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}>({ isOpen: false, setIsOpen: () => {} })

export function ProfileDialogProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <ProfileDialogContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </ProfileDialogContext.Provider>
  )
}

export const useProfileDialog = () => useContext(ProfileDialogContext)

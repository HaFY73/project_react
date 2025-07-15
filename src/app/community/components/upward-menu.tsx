"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, MessageSquare, BookmarkIcon, PenSquare, Menu, type LucideIcon } from "lucide-react"
import { useProfileDialog } from "@/contexts/ProfileDialogContext"

interface UpwardMenuProps {
  className?: string
  onFollowClick: () => void
  onMyPostsClick: () => void
  onMyCommentsClick: () => void
  onSavedClick: () => void
}

interface MenuItem {
  icon: LucideIcon | typeof Avatar
  label: string
  color: string
  onClick: () => void
  isAvatar?: boolean
}

export function UpwardMenu({
  className,
  onFollowClick,
  onMyPostsClick,
  onMyCommentsClick,
  onSavedClick,
}: UpwardMenuProps) {
  const [menuVisible, setMenuVisible] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { setIsOpen } = useProfileDialog()

  // 메뉴 버튼 배열
  const menuItems: MenuItem[] = [
    {
      icon: Avatar,
      label: "프로필",
      color: "bg-purple-500 hover:bg-purple-600",
      onClick: () => setIsOpen(true), // 여기서 바로 useProfileDialog 훅 사용
      isAvatar: true,
    },
    { icon: Users, label: "팔로우", color: "bg-blue-500 hover:bg-blue-600", onClick: onFollowClick },
    { icon: PenSquare, label: "작성한 글", color: "bg-green-500 hover:bg-green-600", onClick: onMyPostsClick },
    {
      icon: MessageSquare,
      label: "댓글단 글",
      color: "bg-yellow-500 hover:bg-yellow-600",
      onClick: onMyCommentsClick,
    },
    { icon: BookmarkIcon, label: "저장한 글", color: "bg-orange-500 hover:bg-orange-600", onClick: onSavedClick },
  ]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuVisible(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleMenuItemClick = (callback: () => void) => (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    callback()
    setMenuVisible(false)
  }

  const handleMainButtonClick = () => setMenuVisible(!menuVisible)

  return (
    <div className={`fixed bottom-20 z-50 ${className ?? "right-6"}`} ref={menuRef}>
      <div className="flex flex-col-reverse items-center gap-3 mb-4">
        {menuItems.map((item, index) => {
          const IconComponent = item.icon
          return (
            <Button
              key={index}
              onClick={handleMenuItemClick(item.onClick)}
              className={`rounded-full w-12 h-12 shadow-lg ${item.color} text-white flex items-center justify-center`}
              style={{
                opacity: menuVisible ? 1 : 0,
                transform: menuVisible ? "translateY(0)" : "translateY(20px)",
                pointerEvents: menuVisible ? "auto" : "none",
                transition: `transform 0.3s ease, opacity 0.3s ease`,
                transitionDelay: `${index * 50}ms`,
              }}
              title={item.label}
              size="icon"
            >
              {item.isAvatar ? (
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback>JC</AvatarFallback>
                </Avatar>
              ) : (
                <IconComponent className="h-5 w-5" />
              )}
            </Button>
          )
        })}
      </div>
      <Button
        className="rounded-full w-14 h-14 shadow-lg bg-[#356ae4] hover:bg-[#356ae4]/90 text-white flex items-center justify-center"
        onClick={handleMainButtonClick}
        size="icon"
      >
        <Menu className="h-6 w-6" />
      </Button>
    </div>
  )
}

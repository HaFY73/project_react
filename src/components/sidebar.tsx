"use client"
import React, { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  FileText,
  PenTool,
  User,
  Settings,
  Home,
  Briefcase,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  className?: string
}

export default function Sidebar({ className }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  // 사이드바 너비를 body 스타일에 반영
  React.useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', isCollapsed ? '80px' : '280px')
  }, [isCollapsed])

  const navigation = [
    {
      name: "홈",
      href: "/",
      icon: Home,
      current: pathname === "/",
    },
    {
      name: "자기소개서",
      href: "/introduce",
      icon: PenTool,
      current: pathname.startsWith("/introduce"),
    },
    {
      name: "이력서",
      href: "/resume",
      icon: FileText,
      current: pathname.startsWith("/resume"),
    },
    {
      name: "채용공고",
      href: "/jobs",
      icon: Briefcase,
      current: pathname.startsWith("/jobs"),
    },
    {
      name: "프로필",
      href: "/profile",
      icon: User,
      current: pathname.startsWith("/profile"),
    },
    {
      name: "설정",
      href: "/settings",
      icon: Settings,
      current: pathname.startsWith("/settings"),
    },
  ]

  return (
    <motion.div
      initial={{ width: isCollapsed ? 80 : 280 }}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-gray-100">Init</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.name}
              onClick={() => router.push(item.href)}
              className={cn(
                "w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200",
                item.current
                  ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
              )}
            >
              <Icon className={cn("h-5 w-5", isCollapsed ? "mx-auto" : "mr-3")} />
              {!isCollapsed && <span>{item.name}</span>}
            </button>
          )
        })}
      </nav>

      {/* User Profile */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                사용자
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                user@example.com
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
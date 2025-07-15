"use client"

import SideLayout from "../sidebar/SideLayout";
import { useState } from "react"
import { useRouter } from "next/navigation";
import { UpwardMenu } from "../components/upward-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Heart, MessageCircle, Share2, Bookmark, Search, Users, UserMinus } from "lucide-react"
import { useProfileDialog } from "@/contexts/ProfileDialogContext"

// 사용자 타입 정의
interface User {
  id: number
  name: string
  avatar: string
  title: string
  followers: number
  following: boolean
  posts: number
}

// 게시글 타입 정의
interface Post {
  id: number
  author: {
    name: string
    avatar: string
    title: string
  }
  content: string
  image?: string
  hashtags: string[]
  likes: number
  comments: number
  timeAgo: string
  category: string
}

// 팔로우 중인 사용자 목데이터
const mockFollowingUsers: User[] = [
  {
    id: 1,
    name: "김개발",
    avatar: "/placeholder.svg?height=40&width=40",
    title: "프론트엔드 개발자",
    followers: 245,
    following: true,
    posts: 32,
  },
  {
    id: 2,
    name: "박디자인",
    avatar: "/placeholder.svg?height=40&width=40",
    title: "UX/UI 디자이너",
    followers: 189,
    following: true,
    posts: 24,
  },
  {
    id: 3,
    name: "이기획",
    avatar: "/placeholder.svg?height=40&width=40",
    title: "프로덕트 매니저",
    followers: 312,
    following: true,
    posts: 41,
  },
  {
    id: 4,
    name: "최마케팅",
    avatar: "/placeholder.svg?height=40&width=40",
    title: "디지털 마케터",
    followers: 178,
    following: true,
    posts: 19,
  },
  {
    id: 5,
    name: "정영업",
    avatar: "/placeholder.svg?height=40&width=40",
    title: "세일즈 매니저",
    followers: 156,
    following: true,
    posts: 27,
  },
]

export default function FollowPage() {
  const [followingUsers, setFollowingUsers] = useState<User[]>(mockFollowingUsers)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter();

  // 검색어에 따른 사용자 필터링
  const filteredUsers = followingUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // 언팔로우 처리
  const handleUnfollow = (userId: number) => {
    setFollowingUsers(followingUsers.filter((user) => user.id !== userId))
    // Also remove posts by this user from the feed, or mark them as not from a followed user.
    // For simplicity, this example only filters the user list.
  }

  return (
    <SideLayout>
      <div className="flex-1 min-h-screen bg-blue-50 overflow-y-auto">
        <div className="px-6 py-8 w-full max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="mb-6 pt-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center">
              <Users className="mr-2 h-6 w-6" />
              팔로우
            </h1>
            <p className="text-gray-500">팔로우 중인 사용자를 확인하세요.</p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="사용자 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border-gray-300 focus:border-[#356ae4] focus:ring-[#356ae4]"
              />
            </div>
          </div>

          {/* Users Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <Card key={user.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.avatar || "/placeholder.svg?height=48&width=48&query=generic+avatar"} />
                          <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-gray-900">{user.name}</h3>
                          <p className="text-sm text-gray-500">{user.title}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnfollow(user.id)}
                        className="border-[#356ae4] text-[#356ae4] hover:bg-[#356ae4]/10 hover:text-[#356ae4]"
                      >
                        <UserMinus className="h-4 w-4 mr-1" />
                        팔로잉
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2 pb-4">
                    <div className="flex justify-between text-sm">
                      <div>
                        <p className="font-medium">{user.followers}</p>
                        <p className="text-gray-500">팔로워</p>
                      </div>
                      <div>
                        <p className="font-medium">{user.posts}</p>
                        <p className="text-gray-500">게시글</p>
                      </div>
                      <div>
                        <Button variant="ghost" size="sm" className="text-[#356ae4] p-0 h-auto hover:bg-transparent">
                          프로필 보기
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12 bg-white rounded-lg shadow-sm">
                <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
                <p className="text-gray-500 max-w-md mx-auto">다른 검색어로 시도해보세요.</p>
              </div>
            )}
          </div>
        </div>
        <UpwardMenu
            className="fixed bottom-6 right-6 z-[999]"
            onFollowClick={() => router.push("/community/follow")}
            onMyPostsClick={() => router.push("/community/write")}
            onMyCommentsClick={() => router.push("/community/reply")}
            onSavedClick={() => router.push("/community/bookmark")}
        />
      </div>
    </SideLayout>
  )
}

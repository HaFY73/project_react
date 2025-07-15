"use client"

"use client"

import SideLayout from "../sidebar/SideLayout";
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation";
import Image from "next/image"
import { UpwardMenu } from "../components/upward-menu";
import { getPosts, getFollowingPosts, getPostsByCategory, searchPosts, toggleLike, addComment  } from "@/lib/post-api"
import { getCurrentUserId } from "@/utils/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Search, Users, Globe, Briefcase, Palette, Code, TrendingUp, Phone,
  Coffee, Lightbulb, GraduationCap, Target, Heart, MessageCircle,
  Share2, Bookmark, Rss, FilterX, BookOpen, ClipboardList, Package,
  Building, Star, Brain, UserPlus, UserCheck, Send, type LucideIcon
} from "lucide-react"
import { Carousel, AdaptedPostCard } from "../components/carousel/carousel-components"
import { CategoryDropdown } from "../components/category-dropdown"
import '../components/carousel/carousel.css'

export interface Category {
  icon: LucideIcon
  label: string
  key: string
  color: string
  type: "job" | "topic"
}

export interface Comment {
  id: number | string
  author: { name: string; avatar: string; title?: string }
  content: string
  likes: number
  timeAgo: string
}

export interface Post {
  id: number
  author: { name: string; avatar: string; title: string; isFollowing?: boolean }
  title: string
  content: string
  image?: string
  hashtags: string[]
  likes: number
  comments: number
  timeAgo: string
  jobCategory?: string
  topicCategory?: string
  likedByMe?: boolean
  commentsList?: Comment[]
}

const jobCategoriesList: Category[] = [
  { icon: Briefcase, label: "경영/기획/전략", key: "management", color: "#3498db", type: "job" },
  { icon: Palette, label: "디자인/컨텐츠", key: "design", color: "#e74c3c", type: "job" },
  { icon: Code, label: "개발/IT", key: "dev", color: "#356ae4", type: "job" },
  { icon: TrendingUp, label: "마케팅/브랜딩", key: "marketing", color: "#f39c12", type: "job" },
  { icon: Phone, label: "영업/고객관리", key: "sales", color: "#27ae60", type: "job" },
  { icon: BookOpen, label: "교육/강의/연구", key: "education", color: "#9b59b6", type: "job" },
  { icon: ClipboardList, label: "운영/사무관리", key: "operations", color: "#34495e", type: "job" },
  { icon: Package, label: "생산/물류/품질관리", key: "logistics", color: "#795548", type: "job" },
  { icon: Building, label: "사회/공공기관", key: "public", color: "#607d8b", type: "job" },
  { icon: Star, label: "특수직", key: "special", color: "#ff5722", type: "job" },
]

const topicCategoriesList: Category[] = [
  { icon: Coffee, label: "일상공유", key: "daily", color: "#8B4513", type: "topic" },
  { icon: Lightbulb, label: "업무관련팁", key: "tips", color: "#FFCC00", type: "topic" },
  { icon: GraduationCap, label: "커리어조언", key: "career", color: "#4B0082", type: "topic" },
  { icon: Target, label: "취업준비", key: "job-prep", color: "#DC143C", type: "topic" },
  { icon: Brain, label: "자기계발", key: "self-dev", color: "#1abc9c", type: "topic" },
]

const allCategories = [...jobCategoriesList, ...topicCategoriesList]

export default function FeedPage() {
  const [currentPostIndex, setCurrentPostIndex] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [posts, setPosts] = useState<Post[]>([])
  const [detailedPost, setDetailedPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [feedMode, setFeedMode] = useState<"all" | "following">("all")
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string | null>(null)
  const [newComment, setNewComment] = useState("")
  const [visibleComments, setVisibleComments] = useState(5)
  const contentRef = useRef<HTMLDivElement>(null)
  const handleOpenPostDetail = (post: Post) => setDetailedPost(post);
  const userId = getCurrentUserId();
  const router = useRouter()

  useEffect(() => {
    let fetchData = getPosts;

    if (feedMode === "following") {
      fetchData = () => getFollowingPosts(1);
    } else if (selectedCategoryKey) {
      fetchData = () => getPostsByCategory(selectedCategoryKey);
    } else if (searchQuery) {
      fetchData = () => searchPosts(searchQuery);
    }

    fetchData()
        .then(res => {
          setPosts(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error("게시글 로딩 오류:", err)
          setLoading(false);
        });
  }, [feedMode, selectedCategoryKey, searchQuery]);

  useEffect(() => {
    if (posts.length > 0) setCurrentPostIndex(Math.floor(posts.length / 2))
  }, [posts])

  const handleCategoryClick = (key: string) => {
    setSelectedCategoryKey(key === selectedCategoryKey ? null : key)
  }

  const handleLikeToggle = (postId: number) => {
    const newPosts = posts.map(p =>
        p.id === postId ? { ...p, likedByMe: !p.likedByMe, likes: p.likedByMe ? p.likes - 1 : p.likes + 1 } : p
    )
    setPosts(newPosts)

    if (detailedPost && detailedPost.id === postId) {
      setDetailedPost(prev =>
          prev ? { ...prev, likedByMe: !prev.likedByMe, likes: prev.likedByMe ? prev.likes - 1 : prev.likes + 1 } : null
      )
    }

    if (userId != null) {
      toggleLike(postId, userId);
    }
  }

  const handleFollowToggle = (authorName: string) => {
    const newPosts = posts.map(p =>
        p.author.name === authorName ? { ...p, author: { ...p.author, isFollowing: !p.author.isFollowing } } : p
    )
    setPosts(newPosts)

    if (detailedPost && detailedPost.author.name === authorName) {
      setDetailedPost(prev =>
          prev ? { ...prev, author: { ...prev.author, isFollowing: !prev.author.isFollowing } } : null
      )
    }

    fetch(`http://localhost:8081/api/follows?followerId=${1}&followingId=${2}`, { method: "POST" })
  }

  const handleCommentSubmit = () => {
    if (!newComment.trim() || !detailedPost || typeof userId !== "number") return;

    addComment(detailedPost.id, userId, newComment)
        .then(() => setNewComment(""))
        .catch(console.error);

    const newCommentObj: Comment = {
      id: `temp-${Date.now()}`,
      author: { name: "Current User", avatar: "/placeholder.svg", title: "Test User Title" },
      content: newComment,
      likes: 0,
      timeAgo: "방금 전",
    }

    const updatedPosts = posts.map(p =>
        p.id === detailedPost.id
            ? { ...p, comments: p.comments + 1, commentsList: [...(p.commentsList || []), newCommentObj] }
            : p
    )
    setPosts(updatedPosts)

    setDetailedPost(prev =>
        prev ? { ...prev, comments: prev.comments + 1, commentsList: [...(prev.commentsList || []), newCommentObj] } : null
    )
  }
  if (loading) return <div className="flex justify-center items-center h-full">로딩중...</div>

  return (
      <SideLayout>
        <div className="flex flex-1 flex-col min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="flex-1 overflow-y-auto relative" ref={contentRef}>
            <div className="max-w-6xl mx-auto px-4 py-8">
              {/* 필터 헤더 */}
              <div className="mb-6 pt-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center">
                  <Rss className="mr-2 h-6 w-6" />
                  피드
                </h1>
                <p className="text-gray-500">커뮤니티의 최신 소식을 확인하고 이야기를 나눠보세요.</p>
              </div>

              {/* 카테고리 & 검색 */}
              <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div className="flex justify-center md:justify-start gap-2 order-2 md:order-1 w-full md:w-auto md:flex-grow">
                  <CategoryDropdown
                      label="직무별 카테고리"
                      categories={jobCategoriesList}
                      selectedKey={selectedCategoryKey}
                      onSelect={handleCategoryClick}
                      dropdownWidth={jobCategoriesList.length > 5 ? 700 : jobCategoriesList.length * 140}
                      gridCols={jobCategoriesList.length > 5 ? 5 : jobCategoriesList.length}
                      align="left"
                  />
                  <CategoryDropdown
                      label="주제별 카테고리"
                      categories={topicCategoriesList}
                      selectedKey={selectedCategoryKey}
                      onSelect={handleCategoryClick}
                      dropdownWidth={topicCategoriesList.length * 130}
                      gridCols={topicCategoriesList.length}
                      align="left"
                  />
                  {selectedCategoryKey && (
                      <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedCategoryKey(null)}
                          className="text-gray-600 hover:text-red-500 h-full px-3 py-2.5 rounded-full"
                          title="필터 해제"
                      >
                        <FilterX className="h-4 w-4" />
                      </Button>
                  )}
                </div>
                <div className="relative w-full md:w-auto md:max-w-xs order-1 md:order-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                      placeholder="검색..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2.5 w-full border-gray-300 focus:border-[#356ae4] focus:ring-[#356ae4] rounded-full text-sm"
                  />
                </div>
              </div>

              {/* 전체 / 팔로우 탭 */}
              <div className="mb-8 flex justify-center">
                <div className="filter-toggle">
                  <button
                      className={`filter-button ${feedMode === "all" ? "active" : ""}`}
                      onClick={() => setFeedMode("all")}
                  >
                    <div className="filter-icon"><Globe size={18} /></div>
                    <div className="filter-content"><span className="filter-text">전체</span></div>
                  </button>
                  <button
                      className={`filter-button ${feedMode === "following" ? "active" : ""}`}
                      onClick={() => setFeedMode("following")}
                  >
                    <div className="filter-icon"><Users size={18} /></div>
                    <div className="filter-content"><span className="filter-text">팔로우</span></div>
                  </button>
                  <div className={`filter-background ${feedMode === "following" ? "right" : "left"}`} />
                </div>
              </div>

              {/* 게시글 Carousel */}
              <div className="carousel-container-wrapper">
                <Carousel initialActiveIndex={currentPostIndex} onCardClick={handleOpenPostDetail}>
                  {posts.map((post) => (
                      <AdaptedPostCard
                          key={post.id}
                          post={post}
                          allCategories={allCategories}
                          onCardClick={handleOpenPostDetail}
                          onLike={handleLikeToggle}
                          onFollowToggle={handleFollowToggle}
                          isActive={false}
                      />
                  ))}
                </Carousel>
              </div>
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

        {/* 상세보기 모달 */}
        {detailedPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <Dialog open={!!detailedPost} onOpenChange={() => setDetailedPost(null)}>
              <DialogContent className="sm:max-w-3xl w-full h-[85vh] max-h-[900px] flex flex-col overflow-hidden p-0">
                <DialogHeader className="p-6 pb-3 border-b border-gray-100 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={detailedPost.author.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{detailedPost.author.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <DialogTitle className="text-base font-semibold">{detailedPost.author.name}</DialogTitle>
                        <DialogDescription className="text-xs text-gray-500">
                          {detailedPost.author.title} · {detailedPost.timeAgo}
                        </DialogDescription>
                      </div>
                    </div>
                    <Button
                        variant={detailedPost.author.isFollowing ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleFollowToggle(detailedPost.author.name)}
                        className={`${detailedPost.author.isFollowing ? "bg-blue-500 hover:bg-blue-600 text-white" : "border-blue-500 text-blue-500 hover:bg-blue-50"}`}
                    >
                      {detailedPost.author.isFollowing ? (
                          <UserCheck className="h-4 w-4 mr-1.5" />
                      ) : (
                          <UserPlus className="h-4 w-4 mr-1.5" />
                      )}
                      {detailedPost.author.isFollowing ? "팔로잉" : "팔로우"}
                    </Button>
                  </div>
                  <h2 className="text-xl font-bold mt-2">{detailedPost.title}</h2>
                </DialogHeader>

                <Tabs defaultValue="post" className="flex-1 flex flex-col overflow-hidden">
                  <TabsList className="grid w-full grid-cols-2 bg-transparent px-6 py-2 border-b border-gray-100">
                    <TabsTrigger value="post" className="text-sm font-medium px-2 py-2 data-[state=active]:text-black data-[state=inactive]:text-gray-400">
                      게시글
                    </TabsTrigger>
                    <TabsTrigger value="comments" className="text-sm font-medium px-2 py-2 data-[state=active]:text-black data-[state=inactive]:text-gray-400">
                      댓글 {detailedPost.commentsList?.length || 0}개
                    </TabsTrigger>
                  </TabsList>

                  {/* 게시글 탭 */}
                  <TabsContent value="post" className="flex-1 px-6 py-4 overflow-auto bg-white"
                               style={{ minHeight: '500px', maxHeight: 'calc(85vh - 150px)' }}>
                    <div className="space-y-4 pr-2">
                      {detailedPost.image && (
                          <div className="relative w-full h-[300px] bg-gray-100 rounded-md">
                            <Image
                                src={detailedPost.image}
                                alt={detailedPost.title || "Post image"}
                                layout="fill"
                                objectFit="contain"
                                className="rounded-md"
                            />
                          </div>
                      )}
                      <p className="text-gray-700 whitespace-pre-line leading-relaxed text-base">
                        {detailedPost.content}
                      </p>
                      <div className="flex flex-wrap gap-2 pt-4">
                        {detailedPost.hashtags.map((tag, index) => (
                            <Badge
                                key={index}
                                variant="secondary"
                                className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200"
                            >
                              {tag}
                            </Badge>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  {/* 댓글 탭 */}
                  <TabsContent value="comments" className="flex-1 flex flex-col min-h-0">
                    <div className="flex-1 overflow-auto px-6 py-4">
                      {detailedPost.commentsList && detailedPost.commentsList.length > 0 ? (
                          <div className="space-y-4">
                            {detailedPost.commentsList.slice(0, visibleComments).map((comment) => (
                                <div key={comment.id} className="py-3 border-b border-gray-100 last:border-b-0">
                                  <div className="flex items-start gap-3">
                                    <Avatar className="h-8 w-8 flex-shrink-0">
                                      <AvatarImage src={comment.author.avatar || "/placeholder.svg"} />
                                      <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <p className="font-semibold text-sm truncate">{comment.author.name}</p>
                                        {comment.author.title && (
                                            <p className="text-xs text-gray-500 truncate">{comment.author.title}</p>
                                        )}
                                        <p className="text-xs text-gray-400 ml-auto flex-shrink-0">{comment.timeAgo}</p>
                                      </div>
                                      <p className="text-sm text-gray-700 break-words">{comment.content}</p>
                                      <div className="flex items-center gap-4 mt-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-xs text-gray-500 hover:text-red-500 p-0 h-auto"
                                        >
                                          <Heart className="h-3 w-3 mr-1" />
                                          {comment.likes}
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                            ))}

                            {visibleComments < (detailedPost.commentsList?.length || 0) && (
                                <div className="text-center py-4">
                                  <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-blue-600 hover:bg-blue-50"
                                      onClick={() => setVisibleComments((prev) => prev + 5)}
                                  >
                                    댓글 더 보기 ({detailedPost.commentsList!.length - visibleComments}개 남음)
                                  </Button>
                                </div>
                            )}
                          </div>
                      ) : (
                          <div className="flex-1 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                              <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                              <p>아직 댓글이 없습니다.</p>
                              <p className="text-sm">첫 번째 댓글을 작성해보세요!</p>
                            </div>
                          </div>
                      )}
                    </div>

                    <div className="bg-gray-50 p-4 flex-shrink-0">
                      <div className="border-t border-gray-200 bg-gray-50 p-4 flex items-center gap-3">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src="/placeholder.svg" />
                          <AvatarFallback>CU</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 flex items-center gap-2 bg-white rounded-md px-3 py-2">
                          <Textarea
                              placeholder="댓글을 작성하세요"
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              className="flex-1 resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md text-sm min-h-[40px] max-h-[120px]"
                              rows={2}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault()
                                  handleCommentSubmit()
                                }
                              }}
                          />
                          <Button
                              size="icon"
                              className="rounded-full p-2 bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
                              onClick={handleCommentSubmit}
                              disabled={!newComment.trim()}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="border-t border-gray-100 p-4 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-600 hover:text-red-500"
                          onClick={() => handleLikeToggle(detailedPost.id)}
                      >
                        <Heart
                            className="h-4 w-4 mr-1"
                            fill={detailedPost.likedByMe ? "#e11d48" : "none"}
                            stroke={detailedPost.likedByMe ? "none" : "#6b7280"}
                        />
                        {detailedPost.likes}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-500">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        {detailedPost.comments}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-600 hover:text-green-500">
                        <Share2 className="h-4 w-4 mr-1" />
                        공유
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-600 hover:text-orange-500">
                        <Bookmark className="h-4 w-4 mr-1" />
                        저장
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
        </div>
        )}
    </SideLayout>
  )
}

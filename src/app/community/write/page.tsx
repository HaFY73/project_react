"use client"

import SideLayout from "../sidebar/SideLayout";
import {useEffect, useRef, useState} from "react"
import { useRouter } from "next/navigation";
import { getCurrentUserId } from "@/utils/auth"
import { createPost } from "@/lib/post-api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alret"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Command, CommandGroup, CommandItem } from "@/components/ui/command"
import {
  PenSquare, FileText, Clock, Eye, ChevronDown, Hash, ImageIcon, X,
  Heart, MessageCircle, Share2, Bookmark, AlertCircle,
  Briefcase, Palette, Code, TrendingUp, Phone, BookOpen,
  ClipboardList, Package, Building, Star, Coffee, Lightbulb,
  GraduationCap, Target, Brain, Check, type LucideIcon
} from "lucide-react"
import { UpwardMenu } from "../components/upward-menu"
import {Card, CardContent, CardFooter, CardHeader} from "@/components/ui/card";

interface Category {
  icon: LucideIcon
  label: string
  key: string
  color: string
  type: "job" | "topic"
}

interface Post {
  id: number
  content: string
  category: string
  hashtags: string[]
  image?: string
  status: "draft" | "published"
  createdAt: string
  likes: number
  comments: number
}

const allCategories: Category[] = [
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
  { icon: Coffee, label: "일상공유", key: "daily", color: "#8B4513", type: "topic" },
  { icon: Lightbulb, label: "업무관련팁", key: "tips", color: "#FFD700", type: "topic" },
  { icon: GraduationCap, label: "커리어조언", key: "career", color: "#4B0082", type: "topic" },
  { icon: Target, label: "취업준비", key: "job-prep", color: "#DC143C", type: "topic" },
  { icon: Brain, label: "자기계발", key: "self-dev", color: "#1abc9c", type: "topic" },
]

export default function WritePage() {
  const userId = getCurrentUserId()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeTab, setActiveTab] = useState<"write" | "drafts" | "published">("write")
  const [drafts, setDrafts] = useState<Post[]>([])
  const [published, setPublished] = useState<Post[]>([])
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [categoryType, setCategoryType] = useState<"job" | "topic">("job")
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string | null>(null)
  const [displayCategoryText, setDisplayCategoryText] = useState("카테고리 선택")
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [newPost, setNewPost] = useState({
    category: "",
    content: "",
    hashtags: "",
    image: null as string | null,
  })

  useEffect(() => {
    async function loadPublishedPosts() {
      try {
        const res = await fetch(`http://localhost:8081/api/posts/user/${userId}/published`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        const data = await res.json();
        setPublished(data);
      } catch (err) {
        console.error("발행된 게시글 불러오기 실패:", err);
      }
    }

    if (userId) {
      loadPublishedPosts();
    }
  }, [userId]);

  useEffect(() => {
    async function loadDraftPosts() {
      try {
        const res = await fetch(`http://localhost:8081/api/posts/user/${userId}/drafts`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        const data = await res.json();
        setDrafts(data);
      } catch (err) {
        console.error("임시저장 글 불러오기 실패:", err);
      }
    }

    if (userId) {
      loadDraftPosts();
    }
  }, [userId]);

  const visibleCategories = allCategories.filter(c => c.type === categoryType)

  const combinedCategories: Category[] = [...allCategories]

  const handleSavePost = async (status: "draft" | "published") => {
    if (userId == null) return;
    const hashtagsArr = newPost.hashtags.split(",").map(t => t.trim()).filter(Boolean).map(t => t.startsWith("#") ? t : `#${t}`)

    const postData = {
      title: newPost.content.slice(0, 20) || "제목없음",
      content: newPost.content,
      category: selectedCategoryKey || "etc",
      hashtags: hashtagsArr.join(","),
      imageUrl: newPost.image || "/placeholder.svg",
      user: { id: userId }
    }

    try {
      await createPost(postData)
      alert(status === "published" ? "글이 발행되었습니다!" : "글이 임시저장되었습니다!")
      resetForm()
      setActiveTab(status === "draft" ? "drafts" : "published")
    } catch (err) {
      console.error("글 저장 실패:", err)
    }
  }

  const resetForm = () => {
    setNewPost({ category: "", content: "", hashtags: "", image: null })
    setEditingPost(null)
    setShowPreview(false)
    setSelectedCategoryKey(null)
    setDisplayCategoryText("카테고리 선택")
  }

  const handleEditPost = (post: Post) => {
    setEditingPost(post)
    setNewPost({
      category: post.category,
      content: post.content,
      hashtags: post.hashtags.join(", "),
      image: post.image || null
    })
    setActiveTab("write")
    setShowPreview(false)
  }

  // 파일 업로드를 위한 ref
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
    let file: File | null = null

    if ("dataTransfer" in e) {
      e.preventDefault()
      file = e.dataTransfer.files?.[0]
    } else {
      file = e.target.files?.[0] ?? null
    }

    if (file) {
      const imageUrl = URL.createObjectURL(file)
      setNewPost({ ...newPost, image: imageUrl })
    }
  }

  const handleToggleStatus = (postToToggle: Post) => {
    const updatedPost: Post = {
      ...postToToggle,
      status: postToToggle.status === "draft" ? "published" : "draft"
    }
    if (postToToggle.status === "draft") {
      setDrafts(drafts.filter(d => d.id !== postToToggle.id))
      setPublished([updatedPost, ...published])
    } else {
      setPublished(published.filter(p => p.id !== postToToggle.id))
      setDrafts([updatedPost, ...drafts])
    }
  }

  const handleDeletePost = (postToDelete: Post) => {
    if (postToDelete.status === "draft") {
      setDrafts(drafts.filter(d => d.id !== postToDelete.id))
    } else {
      setPublished(published.filter(p => p.id !== postToDelete.id))
    }
  }
  // 게시글 카드 컴포넌트
  const PostCardDisplay = ({ post }: { post: Post }) => {
    const categoryInfo = combinedCategories.find(c => c.key === post.category);
    if (!categoryInfo) return null;
    const CategoryIconRender = categoryInfo?.icon || FileText

    return (
      <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {categoryInfo && (
                <Badge
                  style={{ backgroundColor: `${categoryInfo.color}20`, color: categoryInfo.color }}
                  className="font-normal"
                >
                  <CategoryIconRender className="h-3 w-3 mr-1" />
                  {categoryInfo.label}
                </Badge>
              )}
              {post.status === "draft" && (
                <Badge variant="outline" className="text-gray-500 border-gray-300">
                  임시저장
                </Badge>
              )}
            </div>
            <span className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          <p className="text-sm text-gray-700 mb-3 line-clamp-2">{post.content}</p>

          {post.image && (
            <div className="mb-3">
              <img
                src={post.image || "/placeholder.svg?height=120&width=360&query=post+image"}
                alt="Post image"
                className="mx-auto max-h-48 object-contain rounded-md"
              />
            </div>
          )}

          <div className="flex flex-wrap gap-1 mb-3">
            {post.hashtags.slice(0, 3).map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs bg-[#356ae4]/10 text-[#356ae4] hover:bg-[#356ae4]/20"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>

        <CardFooter className="pt-3 pb-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              {post.status === "published" && (
                <>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Heart className="h-4 w-4 mr-1" />
                    {post.likes}
                  </div>
                  <div className="flex items-center text-gray-500 text-sm">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    {post.comments}
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-gray-600 hover:text-[#356ae4] hover:bg-[#356ae4]/10"
                onClick={() => handleEditPost(post)}
              >
                수정
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-gray-600 hover:text-[#356ae4] hover:bg-[#356ae4]/10"
                onClick={() => handleToggleStatus(post)}
              >
                {post.status === "draft" ? "발행하기" : "임시저장"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-gray-600 hover:text-red-500 hover:bg-red-50"
                onClick={() => handleDeletePost(post)}
              >
                삭제
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    )
  }

  return (
    <SideLayout>
      <div className="flex-1 min-h-screen bg-green-50">
        <div className="px-6 py-8 w-full max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="mb-6 pt-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center">
              <FileText className="mr-2 h-6 w-6" />
              글 작성하기
            </h1>
            <p className="text-gray-500">게시글을 작성하고 관리하세요.</p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "write" | "drafts" | "published")}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="write" className="flex items-center">
                <PenSquare className="h-4 w-4 mr-2" />
                글쓰기 {editingPost ? "(수정중)" : ""}
              </TabsTrigger>
              <TabsTrigger value="drafts" className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                임시저장 ({drafts.length})
              </TabsTrigger>
              <TabsTrigger value="published" className="flex items-center">
                <Eye className="h-4 w-4 mr-2" />
                발행됨 ({published.length})
              </TabsTrigger>
            </TabsList>

            {/* Write Tab */}
            <TabsContent value="write" className="space-y-6 pb-20">
              {" "}
              {/* Added pb-20 for menu visibility */}
              {!showPreview ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold">{editingPost ? "게시글 수정하기" : "새 게시글 작성하기"}</h2>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPreview(true)}
                        disabled={!newPost.content || !newPost.category}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        미리보기
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="postCategory" className="text-sm font-medium">
                        카테고리
                      </label>
                      {/* Popover를 사용하여 카테고리 선택 UI 구현 */}
                      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={popoverOpen}
                            className="w-full justify-between pr-3"
                          >
                            {/* 현재 선택된 카테고리 텍스트 표시 */}
                            {displayCategoryText}
                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                          {/* Popover Content (드롭다운 내용) */}
                          <div className="p-4 space-y-4"> {/* 내부 여백 및 간격 */}
                            {/* Include/Exclude 토글 버튼 그룹 */}
                            <div className="flex p-1 rounded-md bg-gray-100 mb-2">
                              <Button
                                variant={categoryType === "job" ? "default" : "ghost"}
                                className="flex-1 justify-center py-2 text-sm font-medium rounded-md"
                                onClick={() => {
                                  setCategoryType("job");
                                  setSelectedCategoryKey(null); // 카테고리 타입 변경 시 선택 초기화
                                  setNewPost({ ...newPost, category: "" }); // newPost.category 초기화
                                }}
                              >
                                직무별
                              </Button>
                              <Button
                                variant={categoryType === "topic" ? "default" : "ghost"}
                                className="flex-1 justify-center py-2 text-sm font-medium rounded-md"
                                onClick={() => {
                                  setCategoryType("topic");
                                  setSelectedCategoryKey(null); // 카테고리 타입 변경 시 선택 초기화
                                  setNewPost({ ...newPost, category: "" }); // newPost.category 초기화
                                }}
                              >
                                주제별
                              </Button>
                            </div>

                            {/* 카테고리 목록 - ScrollArea로 감싸서 스크롤 가능하게 (옵션) */}
                            <ScrollArea className="h-[200px]"> {/* 높이 조절 가능 */}
                              {categoryType ? (
                                <Command> {/* 검색 기능이 필요 없으면 Command 대신 div 사용 가능 */}
                                  {/* <CommandInput placeholder="카테고리 검색..." /> */}
                                  {/* <CommandEmpty>카테고리를 찾을 수 없습니다.</CommandEmpty> */}
                                  <CommandGroup>
                                    {visibleCategories.map((category) => {
                                      const CategoryIcon = category.icon;
                                      const isSelected = selectedCategoryKey === category.key;
                                      return (
                                        <CommandItem
                                          key={category.key}
                                          value={category.label} // 검색을 위한 값 (CommandInput 사용 시)
                                          onSelect={() => {
                                            setSelectedCategoryKey(category.key);
                                            setNewPost({ ...newPost, category: category.key });
                                            setDisplayCategoryText(category.label); // 드롭다운 텍스트 업데이트
                                            setPopoverOpen(false); // 팝오버 닫기
                                          }}
                                          className="flex items-center justify-between cursor-pointer py-2 px-3 text-sm text-[inherit] hover:bg-blue-100 focus:bg-blue-100 focus:outline-none"

                                        >
                                          <div className="flex items-center gap-2">
                                            <CategoryIcon className="h-4 w-4" style={{ color: category.color }} />
                                            {category.label}
                                          </div>
                                          {isSelected && <Check className="ml-auto h-4 w-4 text-[#5B21B6]" />}
                                        </CommandItem>
                                      );
                                    })}
                                  </CommandGroup>
                                </Command>
                              ) : (
                                <p className="text-sm text-gray-500 text-center py-4">
                                  직무별 또는 주제별을 선택해주세요.
                                </p>
                              )}
                            </ScrollArea>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* ... 내용, 해시태그, 이미지 첨부 등 나머지 CardContent 부분은 동일 ... */}

                    <div className="space-y-2">
                      <label htmlFor="postMainContent" className="text-sm font-medium">
                        내용
                      </label>
                      <Textarea
                        id="postMainContent"
                        placeholder="게시글 내용을 입력하세요..."
                        value={newPost.content}
                        onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                        className="min-h-[200px]"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="postHashtags" className="text-sm font-medium">
                        해시태그
                      </label>
                      <div className="flex items-center">
                        <Hash className="h-4 w-4 mr-2 text-gray-400" />
                        <Input
                          id="postHashtags"
                          placeholder="해시태그 입력 (쉼표로 구분)"
                          value={newPost.hashtags}
                          onChange={(e) => setNewPost({ ...newPost, hashtags: e.target.value })}
                        />
                      </div>
                      <p className="text-xs text-gray-500">예: #취업팁, #면접준비, #포트폴리오</p>
                    </div>

                    <div className="space-y-2">
                      <div
                        className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleImageUpload}
                      >
                        {newPost.image ? (
                          <div className="relative">
                            <img
                              src={newPost.image || "/placeholder.svg"}
                              alt="Uploaded preview"
                              className="mx-auto max-h-48 object-contain rounded-md"
                            />

                            {/* X 버튼 – 이미지 삭제 */}
                            <Button
                              variant="outline"
                              size="icon"
                              className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full bg-white"
                              onClick={() => setNewPost({ ...newPost, image: null })}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <ImageIcon className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                            <p className="text-sm text-gray-500">이미지를 드래그하거나 클릭하여 업로드하세요</p>

                            {/* 숨겨진 파일 업로더 */}
                            <input
                              type="file"
                              accept="image/*"
                              ref={fileInputRef}
                              onChange={handleImageUpload}
                              className="hidden"
                              title="이미지 파일 선택"
                              placeholder="이미지 파일을 선택하세요"
                            />

                            {/* 버튼으로 input 트리거 */}
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              이미지 선택
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                  </CardContent>
                  <CardFooter className="flex items-center justify-between w-full">
                    <Button variant="outline" onClick={resetForm}>
                      {editingPost ? "수정 취소" : "새로 작성"}
                    </Button>
                    <div className="space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => handleSavePost("draft")}
                        disabled={!newPost.content || !newPost.category}
                      >
                        임시저장
                      </Button>
                      <Button
                        onClick={() => handleSavePost("published")}
                        disabled={!newPost.content || !newPost.category}
                        className="bg-[#356ae4] hover:bg-[#356ae4]/90"
                      >
                        {editingPost ? "수정 완료" : "발행하기"}
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ) : (
                // 미리보기 모드
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">미리보기</h2>
                    <Button variant="outline" size="sm" onClick={() => setShowPreview(false)}>
                      <PenSquare className="h-4 w-4 mr-2" />
                      편집으로 돌아가기
                    </Button>
                  </div>

                  <Card className="bg-white shadow-md">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {newPost.category
                            ? (() => {
                                const categoryInfo = combinedCategories.find((c) => c.key === newPost.category)
                                const CategoryIconRender = categoryInfo?.icon || FileText
                                return categoryInfo ? (
                                  <Badge
                                    style={{ backgroundColor: `${categoryInfo.color}20`, color: categoryInfo.color }}
                                    className="font-normal"
                                  >
                                    <CategoryIconRender className="h-3 w-3 mr-1" />
                                    {categoryInfo.label}
                                  </Badge>
                                ) : null
                              })()
                            : null}
                        </div>
                        <span className="text-xs text-gray-400">방금 전</span>
                      </div>
                    </CardHeader>

                    <CardContent className="pb-3">
                      <div className="flex items-center gap-3 mb-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="/placeholder.svg?height=40&width=40" />
                          <AvatarFallback>JC</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-sm">작성자 이름</p>
                          <p className="text-xs text-gray-500">작성자 직함</p>
                        </div>
                      </div>

                      <p className="text-sm text-gray-700 mb-4 whitespace-pre-line">{newPost.content}</p>

                      {newPost.image && (
                        <div className="mb-4">
                          <img
                            src={newPost.image || "/placeholder.svg?height=300&width=560&query=preview+image"}
                            alt="Post image preview"
                            className="mx-auto max-h-48 object-contain rounded-md"
                          />
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1 mb-3">
                        {newPost.hashtags
                          .split(",")
                          .map((tag) => tag.trim())
                          .filter((tag) => tag)
                          .map((tag, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs bg-[#356ae4]/10 text-[#356ae4] hover:bg-[#356ae4]/20"
                            >
                              {tag.startsWith("#") ? tag : `#${tag}`}
                            </Badge>
                          ))}
                      </div>
                    </CardContent>

                    {/* Unified Footer for Preview */}
                    <CardFooter className="pt-3 pb-4 border-t border-gray-100 bg-gray-50/50">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          {/* Always show likes/comments in preview, even if 0 */}
                          <div className="flex items-center text-gray-500 text-sm">
                            <Heart className="h-4 w-4 mr-1" />
                            0 {/* Placeholder for likes in preview */}
                          </div>
                          <div className="flex items-center text-gray-500 text-sm">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            0 {/* Placeholder for comments in preview */}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0 text-gray-600 hover:text-[#356ae4] hover:bg-[#356ae4]/10 rounded-full"
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0 text-gray-600 hover:text-[#356ae4] hover:bg-[#356ae4]/10 rounded-full"
                          >
                            <Bookmark className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardFooter>
                  </Card>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowPreview(false)}>
                      편집하기
                    </Button>
                    <Button variant="outline" onClick={() => handleSavePost("draft")}>
                      임시저장
                    </Button>
                    <Button onClick={() => handleSavePost("published")} className="bg-[#356ae4] hover:bg-[#356ae4]/90">
                      발행하기
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Drafts Tab */}
            <TabsContent value="drafts" className="pb-20">
              {" "}
              {/* Added pb-20 for menu visibility */}
              {drafts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {drafts.map((post) => (
                    <PostCardDisplay key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>임시저장된 게시글이 없습니다</AlertTitle>
                  <AlertDescription>새 게시글을 작성하고 임시저장해보세요.</AlertDescription>
                </Alert>
              )}
            </TabsContent>

            {/* Published Tab */}
            <TabsContent value="published" className="pb-20">
              {" "}
              {/* Added pb-20 for menu visibility */}
              {published.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {published.map((post) => (
                    <PostCardDisplay key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>발행된 게시글이 없습니다</AlertTitle>
                  <AlertDescription>새 게시글을 작성하고 발행해보세요.</AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>

          <UpwardMenu
              className="fixed bottom-6 right-6 z-[999]"
              onFollowClick={() => router.push("/community/follow")}
              onMyPostsClick={() => router.push("/community/write")}
              onMyCommentsClick={() => router.push("/community/reply")}
              onSavedClick={() => router.push("/community/bookmark")}
          />
        </div>
      </div>
    </SideLayout>
  )
}


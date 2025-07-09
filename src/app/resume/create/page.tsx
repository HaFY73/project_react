import Sidebar from "@/components/sidebar"
import ResumeEditor from "@/components/resume/resume-editor"

// 컴포넌트 정의 수정 - resumeId를 undefined로 전달
export default function ResumeCreatePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <main 
        className="p-8 overflow-x-hidden transition-all duration-300"
        style={{ marginLeft: 'var(--sidebar-width, 280px)' }}
      >
        <ResumeEditor resumeId={undefined} />
      </main>
    </div>
  )
}
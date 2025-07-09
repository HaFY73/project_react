import Sidebar from "@/components/sidebar"
import ResumeList from "@/components/resume/resume-list"

export default function ResumePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <main 
        className="p-8 overflow-x-hidden transition-all duration-300"
        style={{ marginLeft: 'var(--sidebar-width, 280px)' }}
      >
        <ResumeList />
      </main>
    </div>
  )
}
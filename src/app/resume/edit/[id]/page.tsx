import Sidebar from "@/components/sidebar"
import ResumeEditor from "@/components/resume/resume-editor"

export default function ResumeEditPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <main 
        className="p-8 overflow-x-hidden transition-all duration-300"
        style={{ marginLeft: 'var(--sidebar-width, 280px)' }}
      >
        <ResumeEditor resumeId={params.id} />
      </main>
    </div>
  )
}
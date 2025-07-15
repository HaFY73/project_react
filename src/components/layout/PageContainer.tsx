"use client"
import Sidebar from "@/components/sidebar"

export default function PageContainer({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <Sidebar />
            <main
                className="p-8 overflow-x-hidden transition-all duration-300"
                style={{ marginLeft: 'var(--sidebar-width, 280px)' }}
            >
                <div className="max-w-6xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}

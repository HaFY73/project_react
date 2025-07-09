'use client';
import { useAuth } from "@/hooks/useAuth"
import GlobalSidebar from "@/components/GlobalSidebar/GlobalSidebar"
import JobCalendarView from "@/components/job-calendar/job-calendar-view"
import { useRouter, useParams } from 'next/navigation'
import { useEffect } from 'react'

export default function UserJobCalendarPage() {
    const { isAuthenticated, isLoading, userId } = useAuth()
    const router = useRouter()
    const params = useParams()
    const urlUserId = params.id as string

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login?redirect=/job-calendar')
            return
        }

        // 로그인한 사용자 ID와 URL의 사용자 ID가 다르면 자신의 페이지로 리다이렉트
        if (isAuthenticated && userId && urlUserId && userId !== urlUserId) {
            router.push(`/job-calendar/${userId}`)
            return
        }

        // URL에 사용자 ID가 없으면 자신의 페이지로 리다이렉트
        if (isAuthenticated && userId && !urlUserId) {
            router.push(`/job-calendar/${userId}`)
            return
        }
    }, [isAuthenticated, isLoading, userId, urlUserId, router])

    if (isLoading) {
        return (
            <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">로딩 중...</p>
                </div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return null // 리다이렉트 중이므로 아무것도 렌더링하지 않음
    }

    // 다른 사용자 페이지에 접근하려고 하는 경우
    if (userId && urlUserId && userId !== urlUserId) {
        return (
            <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-lg mb-2">🔒 접근 권한이 없습니다</div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">자신의 캘린더만 확인할 수 있습니다.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
            <GlobalSidebar />
            <main className="flex-1 p-6 pl-44 overflow-x-hidden">
                <JobCalendarView />
            </main>
        </div>
    )
}
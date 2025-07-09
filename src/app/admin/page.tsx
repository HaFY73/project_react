"use client"

import { useState } from "react"
import { AlertTriangle, Users, TrendingUp, Search, Eye, Trash2, UserX, CheckCircle, XCircle } from "lucide-react"

// Mock 데이터
const mockUsers = [
    {
        id: 1,
        userId: "user001",
        email: "user1@example.com",
        joinDate: "2024-01-15",
        isActive: true,
        activities: [
            { type: "로그인", date: "2024-04-01 14:30", detail: "웹 브라우저" },
            { type: "게시글 작성", date: "2024-04-01 14:35", detail: "새로운 프로젝트 소개" },
            { type: "댓글 작성", date: "2024-04-01 15:20", detail: "좋은 아이디어네요!" },
            { type: "로그아웃", date: "2024-04-01 16:45", detail: "정상 로그아웃" },
        ],
    },
    {
        id: 2,
        userId: "user002",
        email: "user2@example.com",
        joinDate: "2024-02-20",
        isActive: true,
        activities: [
            { type: "로그인", date: "2024-03-30 09:15", detail: "모바일 앱" },
            { type: "프로필 수정", date: "2024-03-30 09:20", detail: "프로필 사진 변경" },
            { type: "로그아웃", date: "2024-03-30 10:30", detail: "정상 로그아웃" },
        ],
    },
    {
        id: 3,
        userId: "user003",
        email: "user3@example.com",
        joinDate: "2024-03-10",
        isActive: false,
        activities: [
            { type: "로그인", date: "2024-03-15 20:45", detail: "웹 브라우저" },
            { type: "계정 비활성화", date: "2024-03-15 21:00", detail: "사용자 요청" },
        ],
    },
    {
        id: 4,
        userId: "user004",
        email: "user4@example.com",
        joinDate: "2024-03-25",
        isActive: true,
        activities: [
            { type: "로그인", date: "2024-04-01 11:20", detail: "웹 브라우저" },
            { type: "게시글 조회", date: "2024-04-01 11:25", detail: "인기 게시글 확인" },
            { type: "로그아웃", date: "2024-04-01 12:00", detail: "정상 로그아웃" },
        ],
    },
    {
        id: 5,
        userId: "user005",
        email: "user5@example.com",
        joinDate: "2024-04-01",
        isActive: true,
        activities: [
            { type: "회원가입", date: "2024-04-01 10:00", detail: "이메일 인증 완료" },
            { type: "로그인", date: "2024-04-01 16:00", detail: "웹 브라우저" },
            { type: "프로필 설정", date: "2024-04-01 16:05", detail: "기본 정보 입력" },
        ],
    },
]

const mockReports = [
    {
        id: 1,
        type: "게시글",
        content: "부적절한 내용이 포함된 게시글입니다.",
        reportCount: 5,
        reportDate: "2024-04-01",
        status: "pending",
    },
    {
        id: 2,
        type: "댓글",
        content: "욕설이 포함된 댓글입니다.",
        reportCount: 3,
        reportDate: "2024-04-02",
        status: "pending",
    },
    {
        id: 3,
        type: "게시글",
        content: "스팸성 게시글입니다.",
        reportCount: 8,
        reportDate: "2024-04-03",
        status: "resolved",
    },
]

const mockStats = {
    totalUsers: 1250,
    todaySignups: 15,
    deactivatedUsers: 23,
    dailyGrowth: [
        { date: "03-25", users: 1200 },
        { date: "03-26", users: 1210 },
        { date: "03-27", users: 1220 },
        { date: "03-28", users: 1235 },
        { date: "03-29", users: 1240 },
        { date: "03-30", users: 1245 },
        { date: "04-01", users: 1250 },
    ],
}

// 활동 타입별 아이콘 반환 함수
const getActivityIcon = (type) => {
    switch (type) {
        case "로그인":
            return <CheckCircle className="h-5 w-5 text-green-500" />
        case "로그아웃":
            return <XCircle className="h-5 w-5 text-gray-500" />
        case "게시글 작성":
            return <Users className="h-5 w-5 text-blue-500" />
        case "댓글 작성":
            return <Users className="h-5 w-5 text-purple-500" />
        case "프로필 수정":
            return <Users className="h-5 w-5 text-orange-500" />
        case "회원가입":
            return <Users className="h-5 w-5 text-green-600" />
        case "계정 비활성화":
            return <UserX className="h-5 w-5 text-red-500" />
        case "게시글 조회":
            return <Eye className="h-5 w-5 text-gray-600" />
        case "프로필 설정":
            return <Users className="h-5 w-5 text-blue-600" />
        default:
            return <Users className="h-5 w-5 text-gray-500" />
    }
}

function AdminDashboard() {
    const [users, setUsers] = useState(mockUsers)
    const [reports, setReports] = useState(mockReports)
    const [searchTerm, setSearchTerm] = useState("")
    const [sortBy, setSortBy] = useState("joinDate")
    const [selectedReport, setSelectedReport] = useState(null)
    const [selectedUser, setSelectedUser] = useState(null)
    const [activeTab, setActiveTab] = useState("users")

    // 회원 검색 및 정렬
    const filteredUsers = users
        .filter(
            (user) =>
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.userId.toLowerCase().includes(searchTerm.toLowerCase()),
        )
        .sort((a, b) => {
            if (sortBy === "email") return a.email.localeCompare(b.email)
            if (sortBy === "joinDate") return new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime()
            return 0
        })

    // 회원 비활성화
    const deactivateUser = (userId) => {
        setUsers(prev => prev.map((user) => (user.id === userId ? { ...user, isActive: false } : user)))
    }

    // 회원 활성화
    const activateUser = (userId) => {
        setUsers(prev => prev.map((user) => (user.id === userId ? { ...user, isActive: true } : user)))
    }

    // 신고 처리
    const handleReport = (reportId, action) => {
        setReports(prev =>
            prev.map((report) =>
                report.id === reportId ? { ...report, status: action === "delete" ? "resolved" : "ignored" } : report,
            )
        )
        setSelectedReport(null)
    }

    // 모달 배경 클릭시 닫기
    const handleModalBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            setSelectedUser(null)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto p-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
                    <p className="text-gray-600 mt-2">시스템 관리 및 모니터링</p>
                </div>

                {/* 탭 네비게이션 */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab("users")}
                            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                                activeTab === "users"
                                    ? "border-blue-500 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                        >
                            <Users className="h-4 w-4" />
                            회원 목록
                        </button>
                        <button
                            onClick={() => setActiveTab("reports")}
                            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                                activeTab === "reports"
                                    ? "border-blue-500 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                        >
                            <AlertTriangle className="h-4 w-4" />
                            신고 처리
                        </button>
                        <button
                            onClick={() => setActiveTab("stats")}
                            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                                activeTab === "stats"
                                    ? "border-blue-500 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                        >
                            <TrendingUp className="h-4 w-4" />
                            통계 대시보드
                        </button>
                    </nav>
                </div>

                {/* 회원 관리 탭 */}
                {activeTab === "users" && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-medium text-gray-900">회원 관리</h2>
                                <p className="text-sm text-gray-600 mt-1">전체 회원 목록을 조회하고 관리할 수 있습니다.</p>
                            </div>
                            <div className="p-6">
                                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                                        <input
                                            type="text"
                                            placeholder="이메일 또는 아이디로 검색..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                        />
                                    </div>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                    >
                                        <option value="joinDate">가입일순</option>
                                        <option value="email">이메일순</option>
                                    </select>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                아이디
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                이메일
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                가입일
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                상태
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                관리
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredUsers.length > 0 ? (
                                            filteredUsers.map((user) => (
                                                <tr
                                                    key={user.id}
                                                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                                                    onClick={() => setSelectedUser(user)}
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {user.userId}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {user.email}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {user.joinDate}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                            <span
                                                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                                    user.isActive
                                                                        ? "bg-green-100 text-green-800"
                                                                        : "bg-gray-100 text-gray-800"
                                                                }`}
                                                            >
                                                                {user.isActive ? "활성" : "비활성"}
                                                            </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                                                        {user.isActive ? (
                                                            <button
                                                                onClick={() => deactivateUser(user.id)}
                                                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                                            >
                                                                <UserX className="h-3 w-3 mr-1" />
                                                                비활성화
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => activateUser(user.id)}
                                                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                                                            >
                                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                                활성화
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                                                    검색 결과가 없습니다.
                                                </td>
                                            </tr>
                                        )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* 회원 활동 내역 모달 */}
                        {selectedUser && (
                            <div
                                className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50"
                                onClick={handleModalBackdropClick}
                            >
                                <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                        <h3 className="text-lg font-medium text-gray-900">회원 활동 내역</h3>
                                        <button
                                            onClick={() => setSelectedUser(null)}
                                            className="text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            <XCircle className="h-6 w-6" />
                                        </button>
                                    </div>

                                    <div className="p-6 space-y-6">
                                        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">아이디</p>
                                                <p className="mt-1 text-sm text-gray-900">{selectedUser.userId}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">이메일</p>
                                                <p className="mt-1 text-sm text-gray-900">{selectedUser.email}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">가입일</p>
                                                <p className="mt-1 text-sm text-gray-900">{selectedUser.joinDate}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">계정 상태</p>
                                                <span
                                                    className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        selectedUser.isActive
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-gray-100 text-gray-800"
                                                    }`}
                                                >
                                                    {selectedUser.isActive ? "활성" : "비활성"}
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900 mb-4">최근 활동 내역</h4>
                                            <div className="space-y-3">
                                                {selectedUser.activities.map((activity, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-start space-x-3 p-3 bg-white border border-gray-200 rounded-lg"
                                                    >
                                                        <div className="flex-shrink-0">
                                                            {getActivityIcon(activity.type)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between">
                                                                <p className="text-sm font-medium text-gray-900">
                                                                    {activity.type}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {activity.date}
                                                                </p>
                                                            </div>
                                                            <p className="text-sm text-gray-500">{activity.detail}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* 신고 처리 탭 */}
                {activeTab === "reports" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                            <div className="bg-red-50 px-6 py-4 border-b border-red-200">
                                <h2 className="text-lg font-medium text-red-900">신고 목록</h2>
                                <p className="text-sm text-red-700 mt-1">신고된 게시글과 댓글을 확인하고 처리하세요.</p>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    {reports.length > 0 ? (
                                        reports
                                            .sort((a, b) => b.reportCount - a.reportCount)
                                            .map((report) => (
                                                <div
                                                    key={report.id}
                                                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                                        selectedReport?.id === report.id
                                                            ? "bg-blue-50 border-blue-300"
                                                            : "hover:bg-gray-50 border-gray-200"
                                                    }`}
                                                    onClick={() => setSelectedReport(report)}
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span
                                                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                                report.type === "게시글"
                                                                    ? "bg-blue-100 text-blue-800"
                                                                    : "bg-gray-100 text-gray-800"
                                                            }`}
                                                        >
                                                            {report.type}
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                                                {report.reportCount}건 신고
                                                            </span>
                                                            <span
                                                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                                    report.status === "pending"
                                                                        ? "bg-yellow-100 text-yellow-800"
                                                                        : "bg-gray-100 text-gray-800"
                                                                }`}
                                                            >
                                                                {report.status === "pending" ? "대기중" : "처리완료"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-2">{report.content}</p>
                                                    <p className="text-xs text-gray-500">{report.reportDate}</p>
                                                </div>
                                            ))
                                    ) : (
                                        <div className="text-center text-gray-500 py-8">
                                            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                            <p>신고된 내용이 없습니다.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                            <div className="bg-blue-50 px-6 py-4 border-b border-blue-200">
                                <h2 className="text-lg font-medium text-blue-900">신고 상세</h2>
                                <p className="text-sm text-blue-700 mt-1">선택된 신고 내용을 확인하고 처리하세요.</p>
                            </div>
                            <div className="p-6">
                                {selectedReport ? (
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900 mb-2">신고 내용</h4>
                                            <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded border">
                                                {selectedReport.content}
                                            </p>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span>신고 수: {selectedReport.reportCount}건</span>
                                            <span>신고일: {selectedReport.reportDate}</span>
                                        </div>
                                        {selectedReport.status === "pending" && (
                                            <div className="flex gap-2 pt-4">
                                                <button
                                                    onClick={() => handleReport(selectedReport.id, "delete")}
                                                    className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    삭제
                                                </button>
                                                <button
                                                    onClick={() => handleReport(selectedReport.id, "ignore")}
                                                    className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                                >
                                                    <XCircle className="h-4 w-4 mr-2" />
                                                    무시
                                                </button>
                                            </div>
                                        )}
                                        {selectedReport.status !== "pending" && (
                                            <div className="rounded-md bg-green-50 p-4">
                                                <div className="flex">
                                                    <CheckCircle className="h-5 w-5 text-green-400" />
                                                    <div className="ml-3">
                                                        <p className="text-sm font-medium text-green-800">
                                                            이미 처리된 신고입니다.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center text-gray-500 py-8">
                                        <Eye className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                        <p>신고 항목을 선택하여 상세 내용을 확인하세요.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* 통계 대시보드 탭 */}
                {activeTab === "stats" && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="p-5">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <Users className="h-6 w-6 text-gray-400" />
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-gray-500 truncate">전체 회원 수</dt>
                                                <dd className="text-lg font-medium text-gray-900">
                                                    {mockStats.totalUsers.toLocaleString()}
                                                </dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="p-5">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <TrendingUp className="h-6 w-6 text-green-400" />
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-gray-500 truncate">오늘 가입자</dt>
                                                <dd className="text-lg font-medium text-green-600">
                                                    +{mockStats.todaySignups}
                                                </dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="p-5">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <UserX className="h-6 w-6 text-red-400" />
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-gray-500 truncate">비활성 회원</dt>
                                                <dd className="text-lg font-medium text-red-600">
                                                    {mockStats.deactivatedUsers}
                                                </dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                            <div className="bg-blue-50 px-6 py-4 border-b border-blue-200">
                                <h2 className="text-lg font-medium text-blue-900">일별 사용자 증가 추이</h2>
                                <p className="text-sm text-blue-700 mt-1">최근 7일간 회원 수 변화</p>
                            </div>
                            <div className="p-6">
                                <div className="h-64 flex items-end justify-between gap-2 p-4">
                                    {mockStats.dailyGrowth.map((day, index) => {
                                        const maxUsers = Math.max(...mockStats.dailyGrowth.map((d) => d.users))
                                        const height = (day.users / maxUsers) * 200
                                        return (
                                            <div key={index} className="flex flex-col items-center gap-2">
                                                <div className="text-xs font-medium text-blue-700">{day.users}</div>
                                                <div
                                                    className="bg-blue-500 rounded-t w-12 transition-all hover:bg-blue-600 cursor-pointer"
                                                    style={{ height: `${height}px` }}
                                                    title={`${day.date}: ${day.users}명`}
                                                />
                                                <div className="text-xs text-gray-500">{day.date}</div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AdminDashboard
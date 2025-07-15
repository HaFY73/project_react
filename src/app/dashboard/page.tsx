"use client"

import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import { motion, AnimatePresence, animate } from "framer-motion"
import {
    User, Edit, Plus, X, ChevronDown,
    Target, CheckCircle,
    AlertCircle, Star, Edit2, Loader2,
    PieChart as PieChartIcon, TrendingUp, Briefcase, ArrowRight,
    Award, Camera, Link, Languages, GraduationCap, Trash2,
    Building, ExternalLink, RefreshCw, Shield
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"

// API 기본 URL
const API_BASE_URL = 'http://localhost:8080/api/home';

// 유틸리티 함수
const cn = (...inputs: any[]) => {
    const classes = inputs.filter(Boolean);
    return classes.join(' ');
}

// 타입 정의
interface ProfileData {
    id?: number;
    userId?: number;
    name: string;
    email: string;
    careerType: string;
    jobTitle: string;
    isMatching?: boolean;
}

interface ConditionsData {
    id?: number;
    userId?: number;
    jobs: string[];
    locations: string[];
    salary: string;
    others: string[];
}

interface ApplicationData {
    id: number;
    userId?: number;
    company: string;
    category: string;
    status: string;
    deadline?: string;
}

interface StatsData {
    totalApplications: number;
    documentPassed: number;
    finalPassed: number;
    rejected: number;
    resumeCount: number;
    coverLetterCount: number;
    bookmarkedCompanies: number;
    deadlinesApproaching: number;
    profileCompletion: ProfileCompletionData;
}

interface ProfileCompletionData {
    basicInfo: boolean;
    desiredConditions: boolean;
    workExperience: boolean;
    education: boolean;
    certificate: boolean;
    language: boolean;
    skill: boolean;
    link: boolean;
    military: boolean;
    portfolio: boolean;
    completionPercentage: number;
}

// 🔥 개선된 JobRecommendation 타입
interface JobRecommendation {
    id?: string;
    company: string;
    title: string;
    location: string;
    experience: string;
    education: string;
    employmentType: string;
    salary: string;
    deadline: string;
    url: string;
    // 백엔드 응답에 추가된 필드들
    keywords?: string[];
    postedDate?: string;
    matchScore?: number;
    description?: string;
    requirements?: string;
    benefits?: string;
    recruitCount?: string;
}

// 토큰 관리 유틸리티
const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('accessToken');
    if (!token) {
        throw new Error('No authentication token found');
    }
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

// 에러 처리 헬퍼
const handleApiError = async (response: Response) => {
    if (response.status === 401) {
        // 토큰 만료 시 로그인 페이지로 리다이렉트
        localStorage.removeItem('authToken');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        window.location.href = '/login';
        throw new Error('Authentication failed');
    }
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
};

// API 함수들 (JWT 인증 적용)
const api = {
    // Profile
    getProfile: async (userId: number): Promise<ProfileData> => {
        const response = await fetch(`${API_BASE_URL}/profile/${userId}`, {
            headers: getAuthHeaders()
        });
        await handleApiError(response);
        return response.json();
    },

    updateProfile: async (userId: number, data: ProfileData): Promise<ProfileData> => {
        const response = await fetch(`${API_BASE_URL}/profile/${userId}`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        await handleApiError(response);
        return response.json();
    },

    // Conditions
    getConditions: async (userId: number): Promise<ConditionsData> => {
        const response = await fetch(`${API_BASE_URL}/conditions/${userId}`, {
            headers: getAuthHeaders()
        });
        await handleApiError(response);
        return response.json();
    },

    updateConditions: async (userId: number, data: ConditionsData): Promise<ConditionsData> => {
        const response = await fetch(`${API_BASE_URL}/conditions/${userId}`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        await handleApiError(response);
        return response.json();
    },

    // Applications
    getApplications: async (userId: number): Promise<ApplicationData[]> => {
        const response = await fetch(`${API_BASE_URL}/applications/${userId}`, {
            headers: getAuthHeaders()
        });
        await handleApiError(response);
        return response.json();
    },

    updateApplicationsBatch: async (applications: ApplicationData[]): Promise<ApplicationData[]> => {
        const response = await fetch(`${API_BASE_URL}/applications/batch`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(applications)
        });
        await handleApiError(response);
        return response.json();
    },

    // Stats
    getStats: async (userId: number): Promise<StatsData> => {
        const response = await fetch(`${API_BASE_URL}/stats/${userId}`, {
            headers: getAuthHeaders()
        });
        await handleApiError(response);
        return response.json();
    },

    // All data
    getAllData: async (userId: number) => {
        const response = await fetch(`${API_BASE_URL}/all/${userId}`, {
            headers: getAuthHeaders()
        });
        await handleApiError(response);
        return response.json();
    },

    // 🔥 개선된 공고 추천 API
    getJobRecommendations: async (userId: number, keywords: string[], locations: string[]): Promise<JobRecommendation[]> => {
        console.log('📡 공고 추천 API 호출:', { userId, keywords, locations });

        const response = await fetch(`${API_BASE_URL}/job-recommendations/${userId}`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ keywords, locations })
        });

        await handleApiError(response);
        const data = await response.json();

        console.log('✅ 공고 추천 응답:', data);

        // 백엔드에서 받은 데이터 후처리
        return data.map((job: any, index: number) => ({
            ...job,
            id: job.id || `${job.company}-${job.title}-${index}`,
            deadline: job.deadline || '정보 없음',
            url: job.url || '#',
            keywords: job.keywords || [],
            postedDate: job.postedDate || '',
            matchScore: job.matchScore || 0
        }));
    }
};

// --- 최적화된 기본 컴포넌트들 ---
const Card = React.memo(React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "rounded-2xl bg-white border border-gray-100 dark:bg-gray-900/50 dark:border-gray-800 shadow-sm backdrop-blur-sm",
                className
            )}
            {...props}
        />
    )
))
Card.displayName = "Card"

const Button = React.memo(React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "outline" | "ghost" | "secondary"
    size?: "sm" | "md" | "lg" | "icon"
}
>(({ className, variant = "default", size = "md", children, ...props }, ref) => {
    const variants = {
        default: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm",
        outline: "border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800",
        ghost: "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800",
        secondary: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
    }

    const sizes = {
        sm: "px-3 py-1.5 text-sm h-8",
        md: "px-4 py-2 text-sm h-10",
        lg: "px-6 py-3 text-base h-12",
        icon: "h-10 w-10"
    }

    return (
        <button
            className={cn(
                "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 disabled:opacity-50",
                variants[variant],
                sizes[size],
                className
            )}
            ref={ref}
            {...props}
        >
            {children}
        </button>
    )
}))
Button.displayName = "Button"

const Input = React.memo(React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ className, ...props }, ref) => (
        <input
            className={cn(
                "flex h-10 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200",
                className
            )}
            ref={ref}
            {...props}
        />
    )
))
Input.displayName = "Input"

const Select = React.memo(React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
    ({ className, ...props }, ref) => (
        <select
            ref={ref}
            className={cn(
                "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            {...props}
        />
    )
));
Select.displayName = "Select";

const Switch = React.memo(React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & { checked?: boolean; onCheckedChange?: (checked: boolean) => void; }
>(({ className, checked = false, onCheckedChange, ...props }, ref) => {
    return (
        <button
            className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:ring-offset-gray-900",
                checked ? 'bg-indigo-600 shadow-md' : 'bg-gray-200 dark:bg-gray-700'
            )}
            role="switch"
            aria-checked={checked}
            onClick={() => onCheckedChange?.(!checked)}
            ref={ref}
            {...props}
        >
            <motion.span
                className="inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out"
                animate={{ x: checked ? '1.25rem' : '0.125rem' }}
                transition={{ type: "spring", stiffness: 700, damping: 30 }}
            />
        </button>
    );
}));
Switch.displayName = "Switch"

const Badge = React.memo(React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "outline" | "danger" | "warning" | "success" }>(
    ({ className, variant = "default", ...props }, ref) => {
        const variants = {
            default: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300",
            outline: "border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300",
            danger: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
            warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
            success: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
        }

        return (
            <div
                ref={ref}
                className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-all duration-200",
                    variants[variant],
                    className
                )}
                {...props}
            />
        )
    }
))
Badge.displayName = "Badge"

// 최적화된 애니메이션 카운터 컴포넌트
const AnimatedCounter = ({ end, label, duration = 1.5, delay = 0 }: {
    end: number, label: string, duration?: number, delay?: number
}) => {
    const nodeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const node = nodeRef.current;
        if (!node) return;

        const controls = animate(0, end, {
            duration,
            delay,
            ease: "easeOut",
            onUpdate(value) {
                node.textContent = Math.round(value).toString();
            }
        });

        return () => controls.stop();
    }, [end, duration, delay]);

    return (
        <div className="text-center">
            <div ref={nodeRef} className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                0
            </div>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
        </div>
    );
};

// --- 🔥 개선된 추천 공고 컴포넌트 ---
const JobRecommendations = React.memo(({ conditions, userId, isParentLoading }: {
    conditions: ConditionsData | null,
    userId: number,
    isParentLoading: boolean // 💡 1. isParentLoading prop 받기
}) => {
    const [recommendations, setRecommendations] = useState<JobRecommendation[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ... getDaysUntilDeadline 함수는 그대로 ...
    const getDaysUntilDeadline = (deadline: string) => {
        if (!deadline || deadline === '정보 없음' || deadline === '') return 999;
        try {
            const today = new Date();
            let deadlineDate: Date;
            if (deadline.includes('T')) {
                deadlineDate = new Date(deadline);
            } else if (deadline.includes('-')) {
                deadlineDate = new Date(deadline + 'T00:00:00');
            } else {
                if (deadline.length === 8) {
                    const year = deadline.substring(0, 4);
                    const month = deadline.substring(4, 6);
                    const day = deadline.substring(6, 8);
                    deadlineDate = new Date(`${year}-${month}-${day}T00:00:00`);
                } else {
                    return 999;
                }
            }
            if (isNaN(deadlineDate.getTime())) {
                console.warn('잘못된 날짜 형식:', deadline);
                return 999;
            }
            const diffTime = deadlineDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays >= 0 ? diffDays : -1;
        } catch (error) {
            console.warn('날짜 파싱 오류:', deadline, error);
            return 999;
        }
    };

    const fetchRecommendations = async () => {
        // 💡 2. 부모가 로딩 중이거나, 조건이 없으면 API 호출 자체를 막습니다.
        if (isParentLoading || !conditions || conditions.jobs.length === 0) {
            setRecommendations([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            console.log('📡 공고 추천 요청:', {
                userId,
                jobs: conditions.jobs,
                locations: conditions.locations
            });

            const data = await api.getJobRecommendations(userId, conditions.jobs, conditions.locations);

            console.log('✅ 공고 추천 데이터 수신:', data);
            setRecommendations(data);

        } catch (err) {
            console.error('❌ 공고 추천 API 호출 실패:', err);
            setError('공고를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 💡 3. useEffect 의존성 배열에 isParentLoading을 추가합니다.
    useEffect(() => {
        fetchRecommendations();
    }, [conditions, userId, isParentLoading]);

    const handleRefresh = () => {
        // handleRefresh는 isParentLoading과 무관하게 동작해야 하므로 그대로 둡니다.
        fetchRecommendations();
    };

    const getDeadlineBadgeVariant = (days: number): "danger" | "warning" | "success" => {
        if (days < 0) return "danger";
        if (days <= 3) return "danger";
        if (days <= 7) return "warning";
        return "success";
    };

    // 💡 4. (선택사항이지만 권장) 부모 데이터 로딩 중일 때 별도의 UI를 보여줍니다.
    if (isParentLoading) {
        return (
            <Card className="p-6 h-[400px] flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                <p className="mt-4 text-gray-500">사용자 정보 로딩 중...</p>
            </Card>
        );
    }

    if (!conditions || conditions.jobs.length === 0) {
        return (
            <Card className="p-6 h-[400px] flex flex-col items-center justify-center">
                <Building className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">추천 공고</h3>
                <p className="text-gray-500 dark:text-gray-400 text-center mb-4">
                    희망 직무를 설정하면<br />맞춤 공고를 추천해드려요
                </p>
                <Button variant="outline" onClick={() => window.location.href = '/profile'}>
                    희망 조건 설정하기
                </Button>
            </Card>
        );
    }

    // ... 나머지 return JSX는 그대로 유지 ...
    return (
        <Card className="p-6 h-[400px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center">
                    <Building className="w-5 h-5 mr-2 text-indigo-500" />
                    추천 공고
                </h3>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                        {conditions.jobs.join(', ')}
                    </Badge>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8"
                        onClick={handleRefresh}
                        disabled={loading}
                    >
                        <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                    </Button>
                </div>
            </div>

            {error && (
                <div className="flex items-center justify-center h-full text-red-500">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    공고를 불러오는 중...
                </div>
            ) : (
                <div className="space-y-3 overflow-y-auto flex-grow pr-2">
                    {recommendations.map((job, index) => {
                        const daysLeft = getDaysUntilDeadline(job.deadline);
                        return (
                            <motion.div
                                key={job.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer group"
                                onClick={() => job.url && job.url !== '#' ? window.open(job.url, '_blank') : null}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-semibold text-gray-800 dark:text-gray-200 truncate text-sm">
                                                {job.company}
                                            </p>
                                            {job.url && job.url !== '#' && (
                                                <ExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            )}
                                            {job.matchScore && job.matchScore > 70 && (
                                                <Badge variant="success" className="text-xs px-1.5 py-0">
                                                    매칭 {job.matchScore}%
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate mb-2">
                                            {job.title}
                                        </p>
                                        {job.recruitCount && (
                                            <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">
                                                채용인원: {job.recruitCount}명
                                            </p>
                                        )}
                                        <div className="flex flex-wrap gap-1 mb-2">
                                            <Badge variant="outline" className="text-xs py-0 px-1.5">
                                                {job.location}
                                            </Badge>
                                            <Badge variant="outline" className="text-xs py-0 px-1.5">
                                                {job.experience}
                                            </Badge>
                                            <Badge variant="outline" className="text-xs py-0 px-1.5">
                                                {job.employmentType}
                                            </Badge>
                                        </div>
                                        {job.keywords && job.keywords.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                {job.keywords.slice(0, 2).map((keyword, i) => (
                                                    <span key={i} className="text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded">
                                                        {keyword}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        {daysLeft >= 0 && daysLeft <= 365 && (
                                            <Badge
                                                variant={getDeadlineBadgeVariant(daysLeft)}
                                                className="text-xs mb-1"
                                            >
                                                D-{daysLeft}
                                            </Badge>
                                        )}
                                        <p className="text-xs text-gray-500">
                                            {job.deadline !== '정보 없음' ? job.deadline : '마감일 미정'}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {!loading && !error && recommendations.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-600">
                    <Building className="w-12 h-12 mb-4" />
                    <p>추천할 공고가 없습니다.</p>
                    <Button variant="outline" size="sm" className="mt-2" onClick={handleRefresh}>
                        다시 검색
                    </Button>
                </div>
            )}
        </Card>
    );
});
JobRecommendations.displayName = "JobRecommendations";

// --- 페이지 컴포넌트들 (메모이제이션 적용) ---
const ProfileCard = React.memo(({ profile, onEdit }: { profile: ProfileData, onEdit: () => void }) => {
    const [isMatching, setIsMatching] = useState(profile.isMatching ?? true)

    const handleMatchingChange = async (checked: boolean) => {
        setIsMatching(checked);
        if (profile.userId) {
            try {
                await api.updateProfile(profile.userId, { ...profile, isMatching: checked });
            } catch (error) {
                console.error('Failed to update matching status:', error);
                setIsMatching(!checked); // 롤백
            }
        }
    };

    return (
        <Card className="p-6 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-100 via-purple-50 to-pink-100 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-full -mr-32 -mt-32 opacity-60"></div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between relative z-10">
                <div className="flex items-center">
                    <div className="relative">
                        <div className="w-16 h-16 overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 rounded-2xl shadow-lg flex items-center justify-center text-white">
                            <span className="text-2xl font-bold">{profile.name.charAt(0)}</span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                    </div>
                    <div className="ml-4">
                        <div className="flex items-center">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{profile.name}</h2>
                        </div>
                        <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            <span>{profile.careerType}</span>
                            <span className="mx-2">•</span>
                            <span>{profile.jobTitle}</span>
                        </div>
                    </div>
                </div>
                <Button variant="outline" size="sm" onClick={onEdit} className="mt-4 md:mt-0 shadow-sm">
                    <Edit2 className="w-4 h-4 mr-2" />
                    프로필 수정
                </Button>
            </div>
        </Card>
    )
});
ProfileCard.displayName = "ProfileCard";

const DesiredConditionsCard = React.memo(({ conditions, onEdit }: { conditions: ConditionsData, onEdit: () => void }) => {
    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">희망 조건</h3>
                <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-500 hover:text-indigo-600" onClick={onEdit}>
                    <Edit className="w-4 h-4" />
                </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">직군 • 직무</p>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{conditions.jobs.join(', ')}</p>
                </div>
                <div className="space-y-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">근무 지역</p>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{conditions.locations.join(', ')}</p>
                </div>
                <div className="space-y-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">연봉</p>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{conditions.salary}만원 이상</p>
                </div>
                <div className="space-y-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">기타 희망사항</p>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{conditions.others.join(', ')}</p>
                </div>
            </div>
        </Card>
    )
});
DesiredConditionsCard.displayName = "DesiredConditionsCard";

const ProfileCompletion = React.memo(({ profileCompletion }: { profileCompletion?: ProfileCompletionData }) => {
    const [progress, setProgress] = useState(0)
    const [isExpanded, setIsExpanded] = useState(false)

    const completionItems = [
        { icon: User, name: '기본 정보', completed: profileCompletion?.basicInfo ?? false, color: 'text-blue-500' },
        { icon: Target, name: '희망 조건', completed: profileCompletion?.desiredConditions ?? false, color: 'text-indigo-500' },
        { icon: Briefcase, name: '업무 경력', completed: profileCompletion?.workExperience ?? false, color: 'text-purple-500' },
        { icon: GraduationCap, name: '학력', completed: profileCompletion?.education ?? false, color: 'text-green-500' },
        { icon: Award, name: '자격증', completed: profileCompletion?.certificate ?? false, color: 'text-yellow-500' },
        { icon: Languages, name: '외국어', completed: profileCompletion?.language ?? false, color: 'text-red-500' },
        { icon: Star, name: '스킬', completed: profileCompletion?.skill ?? false, color: 'text-pink-500' },
        { icon: Link, name: '링크', completed: profileCompletion?.link ?? false, color: 'text-cyan-500' },
        { icon: Shield, name: '병역', completed: profileCompletion?.military ?? false, color: 'text-orange-500' },
        { icon: Camera, name: '프로젝트', completed: profileCompletion?.portfolio ?? false, color: 'text-teal-500' },
    ];

    const completedCount = completionItems.filter(item => item.completed).length

    useEffect(() => {
        const timer = setTimeout(() => {
            setProgress(profileCompletion?.completionPercentage ?? 0)
        }, 500)
        return () => clearTimeout(timer)
    }, [profileCompletion])

    return (
        <Card className="overflow-hidden">
            <div
                className="p-6 cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">프로필 완성도</h3>
                    <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-indigo-600">{Math.round(progress)}%</span>
                        <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                        </motion.div>
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">전체 완성도</span>
                        <span className="text-gray-500 font-medium">{completedCount}/10</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                        <motion.div
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 h-3 rounded-full shadow-sm"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                        />
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="border-t border-gray-100 dark:border-gray-800"
                    >
                        <div className="p-6 pt-4">
                            <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4">전체 항목</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {completionItems.map((item, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={cn(
                                            "flex items-center justify-between p-3 rounded-xl transition-all duration-200 group",
                                            item.completed
                                                ? "bg-gray-50 dark:bg-gray-800/50"
                                                : "bg-gray-50 dark:bg-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn("p-2 rounded-lg", item.completed ? "bg-indigo-100 dark:bg-indigo-900/30" : "bg-gray-200 dark:bg-gray-700")}>
                                                <item.icon className={cn("w-4 h-4", item.color)} />
                                            </div>
                                            <span className={cn( "font-medium", "text-sm text-gray-700 dark:text-gray-300")}>
                                                {item.name}
                                            </span>
                                        </div>
                                        {item.completed && (<CheckCircle className="w-5 h-5 text-green-500" />)}
                                    </motion.div>
                                ))}
                            </div>
                            <div className="mt-6 text-center">
                                <Button className="shadow-md" onClick={() => window.location.href = '/spec-management'}>
                                    프로필 작성하러 가기
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    )
});
ProfileCompletion.displayName = "ProfileCompletion";

const StatsSection = React.memo(({ applications, stats, onEdit }: { applications: ApplicationData[], stats?: StatsData, onEdit: () => void }) => {
    const getStatusCount = (status: string) => applications.filter(app => app.status === status).length;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="p-6 relative overflow-hidden min-h-[180px] cursor-pointer" onClick={onEdit}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-100 via-blue-50 to-indigo-50 rounded-full -mr-16 -mt-16 opacity-60 dark:from-indigo-900/20 dark:via-blue-900/10 dark:to-indigo-900/10" />
                <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-4 relative z-10">지원 현황</h3>
                <div className="grid grid-cols-4 gap-2 relative z-10">
                    <AnimatedCounter end={stats?.totalApplications ?? applications.length} label="지원 완료" />
                    <AnimatedCounter end={stats?.documentPassed ?? getStatusCount('서류 합격')} label="서류 합격" delay={0.2} />
                    <AnimatedCounter end={stats?.finalPassed ?? getStatusCount('최종 합격')} label="최종 합격" delay={0.4} />
                    <AnimatedCounter end={stats?.rejected ?? getStatusCount('불합격')} label="불합격" delay={0.6} />
                </div>
            </Card>
            <Card className="p-6 relative overflow-hidden min-h-[180px]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-100 via-pink-50 to-purple-50 rounded-full -mr-16 -mt-16 opacity-60 dark:from-purple-900/20 dark:via-pink-900/10 dark:to-purple-900/10" />
                <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-4 relative z-10">나의 활동 요약</h3>
                <div className="grid grid-cols-4 gap-2 relative z-10">
                    <AnimatedCounter end={stats?.resumeCount ?? 0} label="작성한 이력서" />
                    <AnimatedCounter end={stats?.coverLetterCount ?? 0} label="완성한 자소서" delay={0.2} />
                    <AnimatedCounter end={stats?.bookmarkedCompanies ?? 0} label="북마크한 기업" delay={0.4} />
                    <AnimatedCounter end={stats?.deadlinesApproaching ?? 0} label="지원 마감 임박" delay={0.6} />
                </div>
            </Card>
        </div>
    )
});
StatsSection.displayName = "StatsSection";

const ChartSection = React.memo(({ applications }: { applications: ApplicationData[] }) => {
    const [chartView, setChartView] = useState<"pie" | "interest">("pie")

    const StatusChart = React.memo(() => {
        const data = [
            { name: "지원 완료", value: applications.filter(a=>a.status === '지원 완료').length, color: "#6366f1" },
            { name: "서류 합격", value: applications.filter(a=>a.status === '서류 합격').length, color: "#8b5cf6" },
            { name: "최종 합격", value: applications.filter(a=>a.status === '최종 합격').length, color: "#10b981" },
            { name: "불합격", value: applications.filter(a=>a.status === '불합격').length, color: "#f43f5e" }
        ].filter(d => d.value > 0);
        const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
            const RADIAN = Math.PI / 180;
            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
            const x = cx + radius * Math.cos(-midAngle * RADIAN);
            const y = cy + radius * Math.sin(-midAngle * RADIAN);
            if (percent < 0.1) return null;
            return (<text x={x} y={y} fill="white" textAnchor={x > cx ? "start" : "end"} dominantBaseline="central" className="text-xs font-bold drop-shadow-md">{`${(percent * 100).toFixed(0)}%`}</text>);
        };
        return (
            <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={data} cx="50%" cy="50%" labelLine={false} label={renderCustomizedLabel} outerRadius={100} innerRadius={40} fill="#8884d8" dataKey="value" animationDuration={1200} paddingAngle={5} cornerRadius={8}>
                            {data.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} stroke={entry.color} />))}
                        </Pie>
                        <Tooltip content={({ active, payload }) => { if (active && payload && payload.length) { return (<div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"><p className="text-sm font-semibold">{`${payload[0].name}: ${payload[0].value}개`}</p></div>) } return null }} />
                    </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center mt-4"><div className="flex flex-wrap justify-center gap-4">{data.map((entry, index) => (<div key={`legend-${index}`} className="flex items-center"><div className="w-3 h-3 rounded-full mr-2 shadow-sm" style={{ backgroundColor: entry.color }} /><span className="text-xs font-medium text-gray-600 dark:text-gray-400">{entry.name}</span></div>))}</div></div>
            </div>
        )
    })
    StatusChart.displayName = "StatusChart";

    const InterestChart = React.memo(({data}: {data: ApplicationData[]}) => {
        const categoryCounts = data.reduce((acc, app) => {
            acc[app.category] = (acc[app.category] || 0) + 1;
            return acc;
        }, {} as {[key: string]: number});

        const chartData = Object.keys(categoryCounts).map(key => ({
            name: key,
            지원수: categoryCounts[key],
        })).sort((a, b) => b.지원수 - a.지원수);

        return (
            <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12}}/>
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="지원수" fill="#8884d8" barSize={30} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        );
    });
    InterestChart.displayName = "InterestChart";

    return (
        <Card className="border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden mb-6">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800/50 flex justify-between items-center">
                <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">지원 현황 분석</h3>
                <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                    <Button variant={chartView === "pie" ? "secondary" : "ghost"} size="sm" onClick={() => setChartView("pie")} className={cn(chartView === "pie" ? "bg-white dark:bg-gray-700 shadow-sm" : "", "transition-all duration-200")}><PieChartIcon className="w-4 h-4 mr-1" /><span>지원 현황</span></Button>
                    <Button variant={chartView === "interest" ? "secondary" : "ghost"} size="sm" onClick={() => setChartView("interest")} className={cn(chartView === "interest" ? "bg-white dark:bg-gray-700 shadow-sm" : "", "transition-all duration-200")}><TrendingUp className="w-4 h-4 mr-1" /><span>관심 직무</span></Button>
                </div>
            </div>
            <div className="p-6">
                <AnimatePresence mode="wait">
                    {chartView === "pie" && (<motion.div key="pie" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}><StatusChart /></motion.div>)}
                    {chartView === "interest" && (<motion.div key="interest" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}><InterestChart data={applications} /></motion.div>)}
                </AnimatePresence>
            </div>
        </Card>
    )
});
ChartSection.displayName = "ChartSection";

const Header = React.memo(({ userName }: { userName?: string }) => {
    return (
        <header className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                    {userName ? `${userName}님의 이력 관리 홈` : '이력 관리 홈'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">나의 모든 취업 활동을 한눈에 확인하세요.</p>
            </div>
        </header>
    )
});
Header.displayName = "Header";

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
    if (!isOpen) return null
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]" onClick={onClose}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white dark:bg-gray-800/95 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 border border-gray-200 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h3>
                    <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full" onClick={onClose}><X className="w-4 h-4" /></Button>
                </div>
                <div className="p-6">{children}</div>
            </motion.div>
        </div>
    )
}

const ProfileEditModal = ({ isOpen, onClose, profileData, onSave }: { isOpen: boolean, onClose: () => void, profileData: ProfileData, onSave: (data: ProfileData) => void }) => {
    const [data, setData] = useState(profileData);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => { setData(profileData) }, [profileData, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData({ ...data, [e.target.name]: e.target.value })
    };

    const handleSave = async () => {
        if (profileData.userId) {
            try {
                setIsLoading(true);
                const updated = await api.updateProfile(profileData.userId, data);
                onSave(updated);
                onClose();
            } catch (error) {
                console.error('Failed to update profile:', error);
                alert('프로필 수정에 실패했습니다. 다시 시도해주세요.');
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="프로필 수정">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">이름</label>
                    <Input name="name" value={data.name} onChange={handleChange} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">이메일</label>
                    <Input name="email" type="email" value={data.email} onChange={handleChange} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">경력</label>
                    <Input name="careerType" value={data.careerType} onChange={handleChange} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">직무</label>
                    <Input name="jobTitle" value={data.jobTitle} onChange={handleChange} />
                </div>
            </div>
            <div className="flex gap-3 mt-8 justify-end">
                <Button variant="outline" onClick={onClose} disabled={isLoading}>취소</Button>
                <Button onClick={handleSave} className="shadow-md" disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    저장
                </Button>
            </div>
        </Modal>
    )
}

const DesiredConditionsEditModal = ({ isOpen, onClose, conditionsData, onSave }: { isOpen: boolean, onClose: () => void, conditionsData: ConditionsData, onSave: (data:ConditionsData) => void }) => {
    const [data, setData] = useState(conditionsData);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => { setData(conditionsData) }, [conditionsData, isOpen]);

    const handleSave = async () => {
        if (conditionsData.userId) {
            try {
                setIsLoading(true);
                const updated = await api.updateConditions(conditionsData.userId, data);
                onSave(updated);
                onClose();
            } catch (error) {
                console.error('Failed to update conditions:', error);
                alert('희망 조건 수정에 실패했습니다. 다시 시도해주세요.');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const TagInput = ({ label, field, placeholder }: { label: string, field: keyof ConditionsData, placeholder: string }) => {
        const [inputValue, setInputValue] = useState("");
        const handleAddItem = () => {
            const currentItems = data[field] as string[];
            if(inputValue.trim() && !currentItems.includes(inputValue.trim())) {
                setData({ ...data, [field]: [...currentItems, inputValue.trim()] });
                setInputValue("")
            }
        };
        const handleRemoveItem = (itemToRemove: string) => {
            const currentItems = data[field] as string[];
            setData({ ...data, [field]: currentItems.filter((item: string) => item !== itemToRemove) })
        };
        return (
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>
                <div className="flex flex-wrap gap-2 mb-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg min-h-[44px] bg-gray-50 dark:bg-gray-800/50">
                    {(data[field] as string[]).map((item: string, i: number) => (
                        <Badge key={i} className="flex items-center gap-1.5 shadow-sm">
                            {item}
                            <button
                                className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-100 transition-colors"
                                onClick={() => handleRemoveItem(item)}
                            >
                                <X size={12}/>
                            </button>
                        </Badge>
                    ))}
                </div>
                <div className="flex gap-2">
                    <Input
                        placeholder={placeholder}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
                    />
                    <Button size="sm" onClick={handleAddItem} className="shadow-sm">
                        <Plus size={16}/>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="희망 조건 수정">
            <div className="space-y-6">
                <TagInput label="직군 • 직무" field="jobs" placeholder="직무 추가" />
                <TagInput label="근무 지역" field="locations" placeholder="지역 추가" />
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">희망 연봉(만원)</label>
                    <Input
                        type="number"
                        value={data.salary}
                        onChange={(e) => setData({...data, salary: e.target.value})}
                    />
                </div>
                <TagInput label="기타 희망사항" field="others" placeholder="희망사항 추가"/>
            </div>
            <div className="flex gap-3 mt-8 justify-end">
                <Button variant="outline" onClick={onClose} disabled={isLoading}>취소</Button>
                <Button onClick={handleSave} className="shadow-md" disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    저장
                </Button>
            </div>
        </Modal>
    )
}

const ApplicationStatusModal = ({ isOpen, onClose, applications, onSave, userId }: { isOpen: boolean, onClose: () => void, applications: ApplicationData[], onSave: (data: ApplicationData[]) => void, userId: number }) => {
    const [apps, setApps] = useState<ApplicationData[]>([])
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setApps(applications.map(app => ({
            ...app,
            deadline: app.deadline ? app.deadline.split('T')[0] : ''
        })));
    }, [isOpen, applications])

    const handleAdd = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const newApp: ApplicationData = {
            id: -Date.now(),
            company: "새로운 회사",
            category: "직무 선택",
            status: '지원 완료',
            userId,
            deadline: tomorrow.toISOString().split('T')[0]
        };
        setApps([newApp, ...apps]);
    }

    const handleRemove = (id: number) => {
        setApps(apps.filter(app => app.id !== id));
    }

    const handleUpdate = (id: number, field: keyof ApplicationData, value: string) => {
        setApps(apps.map(app => app.id === id ? { ...app, [field]: value } : app));
    }

    const handleSave = async () => {
        try {
            setIsLoading(true);
            const updated = await api.updateApplicationsBatch(apps.map(app => ({ ...app, userId })));
            onSave(updated);
            onClose();
        } catch (error) {
            console.error('Failed to update applications:', error);
            alert('지원 현황 수정에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="지원 현황 관리">
            <div className="space-y-4">
                <Button onClick={handleAdd} className="w-full shadow-sm" disabled={isLoading}>
                    <Plus className="w-4 h-4 mr-2" />새 지원내역 추가
                </Button>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2 -mr-2">
                    {apps.map(app => (
                        <div key={app.id} className="grid grid-cols-12 gap-2 items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="col-span-3">
                                <Input
                                    placeholder="회사명"
                                    value={app.company}
                                    onChange={e => handleUpdate(app.id, 'company', e.target.value)}
                                />
                            </div>
                            <div className="col-span-3">
                                <Input
                                    placeholder="직무"
                                    value={app.category}
                                    onChange={e => handleUpdate(app.id, 'category', e.target.value)}
                                />
                            </div>
                            <div className="col-span-3">
                                <Input
                                    type="date"
                                    value={app.deadline}
                                    onChange={e => handleUpdate(app.id, 'deadline', e.target.value)}
                                />
                            </div>
                            <div className="col-span-2">
                                <Select
                                    value={app.status}
                                    onChange={e => handleUpdate(app.id, 'status', e.target.value)}
                                    className="h-10 text-sm"
                                >
                                    <option value="지원 완료">지원 완료</option>
                                    <option value="서류 합격">서류 합격</option>
                                    <option value="최종 합격">최종 합격</option>
                                    <option value="불합격">불합격</option>
                                </Select>
                            </div>
                            <div className="col-span-1 text-right">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-8 h-8 rounded-full"
                                    onClick={() => handleRemove(app.id)}
                                    disabled={isLoading}
                                >
                                    <Trash2 className="w-4 h-4 text-red-500"/>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex gap-3 mt-8 justify-end">
                <Button variant="outline" onClick={onClose} disabled={isLoading}>취소</Button>
                <Button onClick={handleSave} className="shadow-md" disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    저장
                </Button>
            </div>
        </Modal>
    )
}

// 메인 컴포넌트
export default function CareerLogHomePage() {
    const { userId, userName, isLoading: authLoading, isAuthenticated } = useAuth();
    const router = useRouter();

    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [conditionsData, setConditionsData] = useState<ConditionsData | null>(null);
    const [applicationData, setApplicationData] = useState<ApplicationData[]>([]);
    const [stats, setStats] = useState<StatsData | null>(null);

    const [loading, setLoading] = useState(true);

    const [isProfileEditOpen, setIsProfileEditOpen] = useState(false)
    const [isConditionsEditOpen, setIsConditionsEditOpen] = useState(false)
    const [isApplicationStatusOpen, setIsApplicationStatusOpen] = useState(false);

// 🔥 추가: 각각의 저장 작업을 위한 로딩 상태
    const [isProfileLoading, setIsProfileLoading] = useState(false);
    const [isConditionsLoading, setIsConditionsLoading] = useState(false);
    const [isApplicationsLoading, setIsApplicationsLoading] = useState(false);

    // 인증 체크
    useEffect(() => {
        if (!authLoading) {
            if (!isAuthenticated || !userId) {
                console.log('🚫 인증되지 않은 사용자, 로그인 페이지로 리다이렉트');
                router.push('/login');
                return;
            }
        }
    }, [authLoading, isAuthenticated, userId, router]);

    // 데이터 로드
    const loadData = async () => {
        if (!userId) {
            console.log('❌ userId가 없어서 데이터 로드 중단');
            return;
        }

        try {
            setLoading(true);
            console.log('📊 사용자 데이터 로드 중...', { userId });

            // 토큰 확인
            const token = localStorage.getItem('authToken') || localStorage.getItem('accessToken');
            if (!token) {
                console.log('❌ 인증 토큰이 없음, 로그인 페이지로 이동');
                router.push('/login');
                return;
            }

            const allData = await api.getAllData(Number(userId));
            console.log('✅ 데이터 로드 완료:', allData);

            // 프로필 데이터 설정 (기본값 포함)
            setProfileData(allData.profile || {
                name: userName || '사용자',
                email: '',
                careerType: '신입',
                jobTitle: '',
                userId: Number(userId),
                isMatching: true
            });

            // 희망 조건 설정 (기본값 포함)
            setConditionsData(allData.conditions || {
                jobs: [],
                locations: [],
                salary: '0',
                others: [],
                userId: Number(userId)
            });

            // 지원 현황 데이터 설정
            if (allData.applications && allData.applications.length > 0) {
                setApplicationData(allData.applications);
            } else {
                // 데모 데이터 생성
                const getDemoDate = (days: number) => {
                    const date = new Date();
                    date.setDate(date.getDate() + days);
                    return date.toISOString().split('T')[0];
                };

                const demoApplications = [
                    { id: 1, company: "네이버", category: "프론트엔드 개발", status: "지원 완료", deadline: getDemoDate(2), userId: Number(userId) },
                    { id: 2, company: "카카오", category: "백엔드 개발", status: "지원 완료", deadline: getDemoDate(6), userId: Number(userId) },
                    { id: 3, company: "라인", category: "iOS 개발", status: "서류 합격", deadline: getDemoDate(15), userId: Number(userId) },
                    { id: 4, company: "쿠팡", category: "데이터 분석", status: "불합격", deadline: getDemoDate(-10), userId: Number(userId) },
                    { id: 5, company: "토스", category: "서버 개발", status: "최종 합격", deadline: getDemoDate(-20), userId: Number(userId) },
                ];
                setApplicationData(demoApplications);
            }

            setStats(allData.stats);

        } catch (error) {
            console.error('❌ 데이터 로드 실패:', error);

            // 에러 시 기본 데이터 설정
            setProfileData({
                name: userName || '사용자',
                email: '',
                careerType: '신입',
                jobTitle: '',
                userId: Number(userId),
                isMatching: true
            });
            setConditionsData({
                jobs: [],
                locations: [],
                salary: '0',
                others: [],
                userId: Number(userId)
            });
            setApplicationData([]);
            setStats(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId && isAuthenticated && !authLoading) {
            loadData();
        }
    }, [userId, isAuthenticated, authLoading, userName]);

    const handleProfileSave = async (newData: ProfileData) => {
        try {
            setIsProfileLoading(true);
            setProfileData(newData);

            // 성공 알림
            alert('프로필이 성공적으로 저장되었습니다!');
        } catch (error) {
            console.error('프로필 저장 실패:', error);
            alert('프로필 저장에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setIsProfileLoading(false);
        }
    };

    const handleConditionsSave = async (conditionsData: ConditionsData) => {
        try {
            setIsConditionsLoading(true); // 🔥 변경

            // 🔥 jobs가 비어있을 때 UserProfile의 jobTitle을 기본값으로 설정
            if ((!conditionsData.jobs || conditionsData.jobs.length === 0) &&
                profileData?.jobTitle &&
                profileData.jobTitle.trim() !== '') {
                conditionsData.jobs = [profileData.jobTitle];
            }

            const updated = await api.updateConditions(Number(conditionsData.userId), conditionsData);
            setConditionsData(updated);
            setIsConditionsEditOpen(false);

            // 🔥 성공 알림 추가
            alert('희망 조건이 성공적으로 저장되었습니다!');
        } catch (error) {
            console.error('희망 조건 저장 실패:', error);
            alert('희망 조건 저장에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setIsConditionsLoading(false); // 🔥 변경
        }
    };

    const handleApplicationSave = (newData: ApplicationData[]) => {
        setApplicationData(newData);
        if (userId) {
            api.getStats(Number(userId)).then(setStats);
        }
    };

    // 로딩 상태
    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
                <div className="flex items-center gap-2 text-lg">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ ease: "linear", duration: 1, repeat: Infinity }}
                    >
                        <Loader2 className="w-6 h-6" />
                    </motion.div>
                    {authLoading ? '인증 확인 중...' : '데이터 로딩 중...'}
                </div>
            </div>
        );
    }

    // 인증되지 않은 경우
    if (!isAuthenticated || !userId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        로그인이 필요합니다
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        대시보드를 이용하려면 먼저 로그인해주세요.
                    </p>
                    <Button onClick={() => router.push('/login')}>
                        로그인하러 가기
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-black dark:via-gray-950 dark:to-black text-gray-800 dark:text-gray-200">
            <main style={{ marginLeft: '280px' }} className="p-8">
                <div className="max-w-7xl mx-auto space-y-6">
                    <Header userName={userName} />

                    {profileData && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                            <ProfileCard profile={profileData} onEdit={() => setIsProfileEditOpen(true)} />
                        </motion.div>
                    )}

                    {conditionsData && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                            <DesiredConditionsCard conditions={conditionsData} onEdit={() => setIsConditionsEditOpen(true)} />
                        </motion.div>
                    )}

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                        <ProfileCompletion profileCompletion={stats?.profileCompletion} />
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
                        <StatsSection applications={applicationData} stats={stats || undefined} onEdit={() => setIsApplicationStatusOpen(true)} />
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
                        <ChartSection applications={applicationData} />
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }}>
                        <JobRecommendations conditions={conditionsData} onRefresh={() => {}} userId={Number(userId)} />
                    </motion.div>

                </div>
            </main>

            <AnimatePresence>
                {isProfileEditOpen && profileData && (
                    <ProfileEditModal
                        isOpen={isProfileEditOpen}
                        onClose={() => setIsProfileEditOpen(false)}
                        profileData={profileData}
                        onSave={handleProfileSave}
                    />
                )}
                {isConditionsEditOpen && conditionsData && (
                    <DesiredConditionsEditModal
                        isOpen={isConditionsEditOpen}
                        onClose={() => setIsConditionsEditOpen(false)}
                        conditionsData={conditionsData}
                        onSave={handleConditionsSave}
                        userProfile={profileData} // 🔥 이 부분 추가
                    />
                )}
                {isApplicationStatusOpen && userId && (
                    <ApplicationStatusModal
                        isOpen={isApplicationStatusOpen}
                        onClose={() => setIsApplicationStatusOpen(false)}
                        applications={applicationData}
                        onSave={handleApplicationSave}
                        userId={Number(userId)}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}
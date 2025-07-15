// front_login.tsx

"use client"

import React, {useState, useEffect} from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from 'next/navigation'

interface LoginFormProps {
    onFlip: () => void
}

export default function LoginForm({ onFlip }: LoginFormProps) {
    const router = useRouter()
    const [formData, setFormData] = useState({ userId: "", password: "" })
    const [isLoading, setIsLoading] = useState(false)

    // cookie helpers
    const setCookie = (name: string, value: string, days: number = 7) => {
        const expires = new Date()
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000))
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`
    }

    const getCookie = (name: string): string | null => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
        return null;
    }

    // 구글 로그인 URL 파싱 처리
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const googleLogin = urlParams.get('googleLogin');
        const error = urlParams.get('error');

        if (googleLogin === 'success') {
            const authToken = getCookie('authToken');
            const userId = getCookie('userId');
            const userName = getCookie('userName');
            const userRole = getCookie('userRole');

            if (authToken && userId && userName && userRole) {
                localStorage.setItem('authToken', authToken);
                localStorage.setItem('accessToken', authToken);
                localStorage.setItem('userId', userId);
                localStorage.setItem('userName', decodeURIComponent(userName));
                localStorage.setItem('userRole', userRole);

                alert(`${decodeURIComponent(userName)}님, 구글 로그인 성공!`);
                window.history.replaceState({}, document.title, window.location.pathname);
                setTimeout(() => {
                    if (userRole === 'ADMIN') router.push('/admin')
                    else router.push('/dashboard')
                }, 1000);
            } else {
                alert('구글 로그인 처리 중 오류가 발생했습니다. 쿠키를 확인해주세요.');
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        } else if (error) {
            alert('구글 로그인 실패: ' + error);
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [router]);

    async function handleLogin() {
        if (isLoading) return
        setIsLoading(true)

        try {
            const res = await fetch("http://localhost:8080/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                const userData = await res.json()
                const token = userData.token;
                if (token) {
                    localStorage.setItem('authToken', token);
                    localStorage.setItem('accessToken', token);
                    setCookie('authToken', token);
                }
                localStorage.setItem('userId', userData.id.toString())
                localStorage.setItem('userName', userData.name)
                localStorage.setItem('userRole', userData.role)

                setCookie('userId', userData.id.toString())
                setCookie('userName', userData.name)
                setCookie('userRole', userData.role)

                if (userData.role === 'ADMIN') {
                    alert(`관리자 ${userData.name}님, 환영합니다!`)
                    router.push('/admin')
                } else {
                    alert(`${userData.name}님, 환영합니다!`)
                    router.push('/dashboard')
                }
            } else {
                const errData = await res.json()
                alert(errData.message || "로그인 실패: 아이디/비밀번호를 확인해주세요.")
            }
        } catch (err) {
            alert("네트워크 오류가 발생했습니다.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <motion.div
            className="w-[450px] h-[650px] bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl flex flex-col justify-center"
            style={{ backfaceVisibility: "hidden" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            <Link href="/" className="logo text-5xl font-bold text-[#555555] text-center mb-8 hover:scale-105 transition-transform">Init</Link>

            {/* ID */}
            <div className="form-floating relative mb-6">
                <input type="text" id="loginId" value={formData.userId}
                       onChange={(e) => setFormData({...formData, userId: e.target.value})}
                       className="w-full px-4 py-4 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-[#8b5cf6] peer pt-6 bg-white/50"
                       placeholder=" " required
                       onKeyPress={(e) => e.key === 'Enter' && handleLogin()} />
                <label htmlFor="loginId" className="absolute text-sm text-slate-500 duration-300 transform -translate-y-3 scale-75 top-4 left-4 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3">ID</label>
            </div>

            {/* PW */}
            <div className="form-floating relative mb-6">
                <input type="password" id="loginPw" value={formData.password}
                       onChange={(e) => setFormData({...formData, password: e.target.value})}
                       className="w-full px-4 py-4 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-[#8b5cf6] peer pt-6 bg-white/50"
                       placeholder=" " required
                       onKeyPress={(e) => e.key === 'Enter' && handleLogin()} />
                <label htmlFor="loginPw" className="absolute text-sm text-slate-500 duration-300 transform -translate-y-3 scale-75 top-4 left-4 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3">Password</label>
            </div>

            {/* 관리자 안내 */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-700 text-center">💡 관리자 로그인: admin / admin123!</p>
            </div>

            {/* 로그인 */}
            <motion.button
                onClick={handleLogin}
                className="bg-[#6366f1] hover:bg-[#8b5cf6] text-white py-4 rounded-lg mb-6 transition-all font-semibold disabled:opacity-50"
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={isLoading}
            >
                {isLoading ? '로그인 중...' : '로그인'}
            </motion.button>

            <div className="text-center mb-6">
                <Link href="/find-account" className="text-sm text-gray-600 hover:text-[#6366f1]">아이디 · 비밀번호 찾기</Link>
            </div>

            {/* 소셜 */}
            <div className="flex justify-center gap-4 mb-6">
                <SocialButton src="/naver.png" alt="Naver" onClick={() => alert("현재는 구글 로그인만 가능합니다.")} />
                <SocialButton src="/kakao.png" alt="Kakao" onClick={() => alert("현재는 구글 로그인만 가능합니다.")} />
                <SocialButton src="/google.png" alt="Google" onClick={() => window.location.href = "http://localhost:8080/oauth2/authorization/google"} />
            </div>

            <div className="text-center text-sm">
                아직 회원이 아니신가요? <span className="text-[#6366f1] cursor-pointer hover:underline font-semibold" onClick={onFlip}>회원가입</span>
            </div>
        </motion.div>
    )
}

function SocialButton({ src, alt, onClick }: { src: string; alt: string; onClick?: () => void }) {
    return (
        <motion.button className="p-3 rounded-full bg-sky-50 hover:bg-slate-100 transition-colors border border-slate-200 flex items-center justify-center"
                       whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={onClick}>
            <div className="aspect-square relative overflow-hidden rounded">
                <Image src={src} alt={alt} width={32} height={32} className="rounded-full" />
            </div>
        </motion.button>
    )
}

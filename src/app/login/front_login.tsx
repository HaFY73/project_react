"use client"

import React, {useState} from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from 'next/navigation'

interface LoginFormProps {
    onFlip: () => void
}

export default function LoginForm({ onFlip }: LoginFormProps) {
    const router = useRouter()
    const [formData, setFormData] = useState({
        userId: "",
        password: ""
    })
    const [isLoading, setIsLoading] = useState(false)

    // 쿠키 설정 헬퍼 함수
    const setCookie = (name: string, value: string, days: number = 7) => {
        const expires = new Date()
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000))
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`
    }

    // 🔥 수정된 handleLogin 함수 - 에러 처리 개선
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

                // 🔥 백엔드 응답 전체를 로깅해서 토큰 필드명 확인
                console.log('🔥 백엔드 로그인 응답 전체:', userData);
                console.log('🔥 응답 키들:', Object.keys(userData));

                // 🔥 모든 가능한 토큰 필드명 확인
                const possibleTokenFields = ['token', 'accessToken', 'jwt', 'authToken', 'access_token', 'jwtToken'];
                const foundTokenField = possibleTokenFields.find(field => userData[field]);

                if (foundTokenField) {
                    const token = userData[foundTokenField];
                    console.log(`🔑 토큰 발견! 필드명: ${foundTokenField}, 토큰: ${token.substring(0, 20)}...`);

                    // 여러 키로 저장해서 호환성 확보
                    localStorage.setItem('authToken', token);
                    localStorage.setItem('accessToken', token);
                    localStorage.setItem('token', token);
                    localStorage.setItem('jwt', token);

                    setCookie('authToken', token);
                    setCookie('accessToken', token);
                    setCookie('token', token);

                    console.log('✅ 토큰 저장 완료');
                } else {
                    console.error('❌ 토큰을 찾을 수 없습니다! 응답:', userData);
                    // 응답에서 토큰으로 보이는 필드들 찾기
                    Object.keys(userData).forEach(key => {
                        const value = userData[key];
                        if (typeof value === 'string' && value.length > 50) {
                            console.log(`🤔 토큰일 가능성 있는 필드: ${key} = ${value.substring(0, 20)}...`);
                        }
                    });
                }

                // 사용자 정보 저장
                localStorage.setItem('userId', userData.id.toString())
                localStorage.setItem('userName', userData.name)

                // 쿠키에도 저장
                setCookie('userId', userData.id.toString())
                setCookie('userName', userData.name)

                console.log('✅ 사용자 정보 저장 완료:', {
                    userId: userData.id,
                    userName: userData.name,
                    hasToken: !!foundTokenField
                });

                alert(`${userData.name}님, 환영합니다!`)
                router.push('/dashboard')

            } else {
                // 🔥 에러 처리 개선 - 안전한 응답 파싱
                try {
                    const errorText = await res.text(); // JSON 대신 text로 먼저 받기
                    console.log('❌ 로그인 실패 응답 원문:', errorText);
                    console.log('❌ HTTP 상태 코드:', res.status);

                    let errorMessage = "로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.";

                    // JSON 파싱 시도
                    if (errorText && errorText.trim().length > 0) {
                        try {
                            const errorData = JSON.parse(errorText);
                            console.log('📄 파싱된 에러 데이터:', errorData);

                            // 다양한 에러 응답 형태 처리
                            if (errorData.message) {
                                errorMessage = errorData.message;
                            } else if (errorData.data && errorData.data.message) {
                                errorMessage = errorData.data.message;
                            } else if (errorData.error) {
                                errorMessage = errorData.error;
                            }
                        } catch (jsonParseError) {
                            console.log('JSON 파싱 실패, 원문 확인:', jsonParseError);
                            // JSON이 아닌 경우 텍스트 응답을 그대로 사용
                            if (errorText.length > 0 && errorText.length < 200) {
                                errorMessage = errorText;
                            }
                        }
                    }

                    // HTTP 상태 코드별 추가 처리
                    if (res.status === 401) {
                        errorMessage = "아이디 또는 비밀번호가 일치하지 않습니다.";
                    } else if (res.status === 404) {
                        errorMessage = "존재하지 않는 사용자입니다.";
                    } else if (res.status >= 500) {
                        errorMessage = "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
                    }

                    alert(errorMessage);

                } catch (responseError) {
                    console.error('응답 읽기 실패:', responseError);
                    alert("로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.");
                }
            }
        } catch (err) {
            console.error('❌ 로그인 네트워크 에러:', err)
            alert("로그인 중 오류가 발생했습니다. 네트워크 연결을 확인해주세요.")
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
            <Link
                href="/"
                className="logo text-5xl font-bold text-[#555555] text-center mb-8 hover:scale-105 transition-transform"
            >
                Init
            </Link>

            {/* ID 필드 */}
            <div className="form-floating relative mb-6">
                <input
                    type="text"
                    id="loginId"
                    value={formData.userId}
                    onChange={(e) => setFormData({...formData, userId: e.target.value})}
                    className="w-full px-4 py-4 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#356ae4] focus:border-[#356ae4] peer pt-6 bg-white/50"
                    placeholder=" "
                    required
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />
                <label
                    htmlFor="loginId"
                    className="absolute text-sm text-slate-500 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
                >
                    ID
                </label>
            </div>

            {/* Password 필드 */}
            <div className="form-floating relative mb-6">
                <input
                    type="password"
                    id="loginPw"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-4 py-4 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#356ae4] focus:border-[#356ae4] peer pt-6 bg-white/50"
                    placeholder=" "
                    required
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />
                <label
                    htmlFor="loginPw"
                    className="absolute text-sm text-slate-500 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
                >
                    Password
                </label>
            </div>

            {/* Remember me */}
            <div className="remember flex items-center mb-6">
                <input
                    type="checkbox"
                    id="remember"
                    className="h-4 w-4 text-[#356ae4] focus:ring-[#356ae4] border-slate-300 rounded"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-slate-700">
                    아이디 저장
                </label>
            </div>

            {/* 로그인 버튼 */}
            <motion.button
                onClick={handleLogin}
                className="bg-[#356ae4] hover:bg-[#2857c8] text-white py-4 rounded-lg mb-6 transition-all font-semibold disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
            >
                {isLoading ? '로그인 중...' : '로그인'}
            </motion.button>

            {/* 소셜 로그인 */}
            <div className="social-login-row flex justify-center gap-4 mb-6">
                <SocialButton src="/naver.png" alt="Naver" />
                <SocialButton src="/kakao.png" alt="Kakao" />
                <SocialButton src="/google.png" alt="Google" />
            </div>

            {/* 회원가입 이동 */}
            <div className="text-center text-sm">
                아직 회원이 아니신가요?{" "}
                <span
                    className="text-[#356ae4] cursor-pointer hover:underline font-semibold"
                    onClick={onFlip}
                >
                    회원가입
                </span>
            </div>
        </motion.div>
    )
}

function SocialButton({ src, alt }: { src: string; alt: string }) {
    return (
        <motion.button
            className="p-3 rounded-full bg-sky-50 hover:bg-slate-100 transition-colors border border-slate-200 flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
        >
            <div className="aspect-square relative overflow-hidden rounded">
                <Image src={src} alt={alt} width={32} height={32} className="rounded-full" />
            </div>
        </motion.button>
    )
}
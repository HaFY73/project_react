"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Loader2, Mail, CheckCircle, AlertCircle } from "lucide-react"

export default function FindUserId() {
    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState<{
        status: "none" | "success" | "error"
        message: string
        userId?: string
    }>({ status: "none", message: "" })

    const handleFindUserId = async () => {
        if (!email || !email.includes("@")) {
            setResult({
                status: "error",
                message: "올바른 이메일 주소를 입력해주세요."
            })
            return
        }

        setIsLoading(true)
        setResult({ status: "none", message: "" })

        try {
            console.log('🔍 아이디 찾기 시작:', email); // 디버깅용 로그

            const response = await fetch("http://localhost:8080/api/find-userid", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                credentials: 'include', // 🔥 추가된 부분
                body: `email=${encodeURIComponent(email)}`
            })

            console.log('📡 응답 상태:', response.status); // 디버깅용 로그

            if (response.ok) {
                const userId = await response.text()
                console.log('✅ 아이디 찾기 성공:', userId); // 디버깅용 로그
                setResult({
                    status: "success",
                    message: "아이디를 찾았습니다!",
                    userId: userId
                })
            } else {
                const errorMessage = await response.text()
                console.error('❌ 서버 오류:', errorMessage); // 디버깅용 로그
                setResult({
                    status: "error",
                    message: errorMessage || "아이디를 찾을 수 없습니다."
                })
            }
        } catch (error) {
            console.error("❌ 아이디 찾기 오류:", error)

            // 더 구체적인 오류 메시지 제공
            let errorMessage = "네트워크 오류가 발생했습니다."

            if (error instanceof TypeError && error.message.includes('fetch')) {
                errorMessage = "서버에 연결할 수 없습니다. 백엔드 서버가 실행중인지 확인해주세요."
            } else if (error instanceof Error) {
                errorMessage = error.message
            }

            setResult({
                status: "error",
                message: errorMessage
            })
        } finally {
            setIsLoading(false)
        }
    }

    const resetForm = () => {
        setEmail("")
        setResult({ status: "none", message: "" })
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <Mail className="w-12 h-12 text-[#356ae4] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">아이디 찾기</h3>
                <p className="text-sm text-gray-600">
                    가입할 때 사용한 이메일 주소를 입력해주세요
                </p>
            </div>

            {result.status === "none" && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                >
                    {/* 이메일 입력 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            이메일 주소
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="example@email.com"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#356ae4] focus:border-[#356ae4]"
                            onKeyPress={(e) => e.key === "Enter" && handleFindUserId()}
                        />
                    </div>

                    {/* 찾기 버튼 */}
                    <motion.button
                        onClick={handleFindUserId}
                        disabled={isLoading || !email}
                        className="w-full bg-[#356ae4] hover:bg-[#2857c8] text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isLoading ? "찾는 중..." : "아이디 찾기"}
                    </motion.button>
                </motion.div>
            )}

            {/* 성공 결과 */}
            {result.status === "success" && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-4"
                >
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                    <div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">
                            {result.message}
                        </h4>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-2">회원님의 아이디는</p>
                            <p className="text-2xl font-bold text-[#356ae4]">
                                {result.userId}
                            </p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <button
                            onClick={() => window.location.href = "/login"}
                            className="w-full bg-[#356ae4] hover:bg-[#2857c8] text-white py-3 rounded-lg font-semibold"
                        >
                            로그인하러 가기
                        </button>
                        <button
                            onClick={resetForm}
                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold"
                        >
                            다시 찾기
                        </button>
                    </div>
                </motion.div>
            )}

            {/* 에러 결과 */}
            {result.status === "error" && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-4"
                >
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
                    <div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">
                            아이디를 찾을 수 없습니다
                        </h4>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-sm text-red-600">
                                {result.message}
                            </p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <button
                            onClick={resetForm}
                            className="w-full bg-[#356ae4] hover:bg-[#2857c8] text-white py-3 rounded-lg font-semibold"
                        >
                            다시 시도하기
                        </button>
                        <button
                            onClick={() => window.location.href = "/login?signup=true"}
                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold"
                        >
                            회원가입하러 가기
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    )
}
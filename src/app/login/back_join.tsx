"use client"

import React from "react"
import { Eye, EyeOff, Check, X } from "lucide-react"

interface SignupFormProps {
    formData: {
        userId: string
        name: string,
        password: string
        confirmPassword: string
        phone: string
        email: string
        interests: string[]
    }
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    onInterestChange: (val: string) => void
    isPasswordValid: boolean
    isPasswordMatch: boolean
    showPassword: boolean
    showConfirmPassword: boolean
    setShowPassword: (v: boolean) => void
    setShowConfirmPassword: (v: boolean) => void
    onFlip: () => void
}

const interests = [
    "경영/기획/전략",
    "디자인/컨텐츠",
    "개발/IT",
    "마케팅/브랜딩",
    "영업/고객관리",
    "교육/강의/연구",
    "운영/사무관리",
    "생산/물류/품질관리",
    "사회/공공기관",
    "특수직",
]

function PasswordCheck({ ok, label }: { ok: boolean; label: string }) {
    return (
        <div className="flex items-center gap-2">
            {ok ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-red-500" />}
            <span className={ok ? "text-green-600" : "text-red-600"}>{label}</span>
        </div>
    )
}

export default function SignupForm({
                                       formData,
                                       onChange,
                                       onInterestChange,
                                       showPassword,
                                       showConfirmPassword,
                                       setShowPassword,
                                       setShowConfirmPassword,
                                       onFlip,
                                   }: Omit<SignupFormProps, "isPasswordValid" | "isPasswordMatch">) {

    {/* 비밀번호 유효성 검사 */}
    const isPasswordValid =
        formData.password.length >= 8 &&
        /[a-zA-Z]/.test(formData.password) &&
        /\d/.test(formData.password) &&
        /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);

    const isPasswordMatch = formData.password === formData.confirmPassword;

    async function handleSignup() {
        try {
            const res = await fetch("http://localhost:8080/api/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                alert("회원가입 성공!");
                onFlip();
            } else {
                alert("회원가입 실패!");
            }
        } catch (err) {
            console.error(err);
            alert("에러가 발생했습니다.");
        }
    }

    return (
        <div
            className="w-[650px] h-full bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-2xl flex flex-col overflow-y-auto"
            style={{ backfaceVisibility: "hidden" }}
        >
            <h2 className="text-2xl font-bold text-center text-[#356ae4] mb-6">회원가입</h2>

            {/* 이름 */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">이름</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={onChange}
                    placeholder="이름을 입력하세요"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white/50 focus:outline-none focus:ring-2 focus:ring-[#356ae4]"
                />
            </div>

            {/* 아이디 */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">아이디</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        name="userId"
                        value={formData.userId}
                        onChange={onChange}
                        placeholder="영문, 숫자 조합 4-12자"
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white/50 focus:outline-none focus:ring-2 focus:ring-[#356ae4]"
                    />
                    <button
                        type="button"
                        className="bg-slate-200 hover:bg-slate-300 px-3 py-2 rounded-lg text-xs font-semibold"
                    >
                        중복확인
                    </button>
                </div>
            </div>

            {/* 비밀번호 */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">비밀번호</label>
                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={onChange}
                        placeholder="8자 이상, 영문+숫자+특수문자"
                        className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg text-sm bg-white/50 focus:outline-none focus:ring-2 focus:ring-[#356ae4]"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
                {formData.password && (
                    <div className="mt-2 space-y-1 text-xs">
                        <PasswordCheck ok={formData.password.length >= 8} label="8자 이상" />
                        <PasswordCheck
                            ok={
                                /[a-zA-Z]/.test(formData.password) &&
                                /\d/.test(formData.password) &&
                                /[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
                            }
                            label="영문, 숫자, 특수문자 포함"
                        />
                    </div>
                )}
            </div>

            {/* 비밀번호 확인 */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">비밀번호 확인</label>
                <div className="relative">
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={onChange}
                        placeholder="비밀번호를 다시 입력하세요"
                        className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg text-sm bg-white/50 focus:outline-none focus:ring-2 focus:ring-[#356ae4]"
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
                {formData.confirmPassword && (
                    <div className="mt-1 text-xs flex items-center gap-2">
                        {isPasswordMatch ? (
                            <>
                                <Check className="h-3 w-3 text-green-500" />
                                <span className="text-green-600">비밀번호가 일치합니다</span>
                            </>
                        ) : (
                            <>
                                <X className="h-3 w-3 text-red-500" />
                                <span className="text-red-600">비밀번호가 일치하지 않습니다</span>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* 휴대폰 번호 */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">휴대폰 번호</label>
                <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={onChange}
                    placeholder="010-1234-5678"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white/50 focus:outline-none focus:ring-2 focus:ring-[#356ae4]"
                />
            </div>

            {/* 이메일 */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">이메일</label>
                <div className="flex gap-2">
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={onChange}
                        placeholder="example@email.com"
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white/50 focus:outline-none focus:ring-2 focus:ring-[#356ae4]"
                    />
                    <button className="bg-slate-200 hover:bg-slate-300 px-3 py-2 rounded-lg text-xs font-semibold">
                        인증번호
                    </button>
                </div>
            </div>

            {/* 관심분야 */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-3">관심 분야 (복수 선택 가능)</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                    {interests.map((interest, idx) => (
                        <label
                            key={idx}
                            className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors ${
                                formData.interests.includes(interest)
                                    ? "bg-[#356ae4]/10 border border-[#356ae4]/30"
                                    : "hover:bg-slate-50 border border-slate-200"
                            }`}
                        >
                            <input
                                type="checkbox"
                                checked={formData.interests.includes(interest)}
                                onChange={() => onInterestChange(interest)}
                                className="mr-2 h-3 w-3 text-[#356ae4] focus:ring-[#356ae4] rounded"
                            />
                            <span className="text-slate-700">{interest}</span>
                        </label>
                    ))}
                </div>
                <p className="text-xs text-slate-500 mt-2">선택한 관심 분야: {formData.interests.length}개</p>
            </div>

            {/* 회원가입 버튼 */}
            <button
                onClick={handleSignup}
                disabled={!isPasswordValid || !isPasswordMatch || !formData.userId || !formData.email}
                className="bg-[#356ae4] hover:bg-[#2857c8] text-white py-3 rounded-lg font-semibold disabled:opacity-50"
            >
                회원가입
            </button>

            <div className="text-center mt-4 text-sm">
                <span className="text-slate-600">이미 계정이 있으신가요? </span>
                <span
                    className="text-[#356ae4] cursor-pointer hover:underline font-semibold"
                    onClick={onFlip}
                >
                    로그인
                </span>
            </div>
        </div>
    )
}
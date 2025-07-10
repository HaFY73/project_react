"use client"

import React, { useState } from "react"
import { Eye, EyeOff, Check, X, Loader2 } from "lucide-react"
import { authApi } from "@/lib/auth-api"

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

    // 🆕 중복확인 상태 관리
    const [userIdCheck, setUserIdCheck] = useState<{
        status: 'none' | 'checking' | 'available' | 'duplicate' | 'error';
        message: string;
    }>({ status: 'none', message: '' });

    const [emailCheck, setEmailCheck] = useState<{
        status: 'none' | 'checking' | 'available' | 'duplicate' | 'error' | 'sent' | 'verified';
        message: string;
    }>({ status: 'none', message: '' });

    const [emailVerificationCode, setEmailVerificationCode] = useState('');
    const [isSignupLoading, setIsSignupLoading] = useState(false);

    // 비밀번호 유효성 검사
    const isPasswordValid =
        formData.password.length >= 8 &&
        /[a-zA-Z]/.test(formData.password) &&
        /\d/.test(formData.password) &&
        /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);

    const isPasswordMatch = formData.password === formData.confirmPassword;

    // 🆕 아이디 중복확인 함수
    const handleUserIdCheck = async () => {
        if (!formData.userId || formData.userId.trim().length < 4) {
            setUserIdCheck({
                status: 'error',
                message: '아이디는 4자 이상 입력해주세요.'
            });
            return;
        }

        setUserIdCheck({ status: 'checking', message: '확인 중...' });

        try {
            const isDuplicate = await authApi.checkUserIdDuplicate(formData.userId);

            if (isDuplicate) {
                setUserIdCheck({
                    status: 'duplicate',
                    message: '이미 사용중인 아이디입니다.'
                });
            } else {
                setUserIdCheck({
                    status: 'available',
                    message: '사용 가능한 아이디입니다.'
                });
            }
        } catch (error) {
            setUserIdCheck({
                status: 'error',
                message: error instanceof Error ? error.message : '확인 중 오류가 발생했습니다.'
            });
        }
    };

    // 🆕 이메일 인증번호 발송 함수 (중복확인 포함)
    const handleEmailVerificationSend = async () => {
        if (!formData.email || !formData.email.includes('@')) {
            setEmailCheck({
                status: 'error',
                message: '올바른 이메일을 입력해주세요.'
            });
            return;
        }

        setEmailCheck({ status: 'checking', message: '이메일 확인 중...' });

        try {
            // 1단계: 중복확인
            const isDuplicate = await authApi.checkEmailDuplicate(formData.email);

            if (isDuplicate) {
                setEmailCheck({
                    status: 'duplicate',
                    message: '이미 가입된 이메일입니다.'
                });
                return;
            }

            // 2단계: 중복되지 않으면 인증번호 발송
            const result = await authApi.sendEmailVerificationCode(formData.email);

            setEmailCheck({
                status: 'sent',
                message: result
            });

        } catch (error) {
            setEmailCheck({
                status: 'error',
                message: error instanceof Error ? error.message : '오류가 발생했습니다.'
            });
        }
    };

    // 🆕 이메일 인증번호 확인 함수
    const handleEmailVerificationCheck = async () => {
        if (!emailVerificationCode || emailVerificationCode.length !== 6) {
            alert('인증번호 6자리를 입력해주세요.');
            return;
        }

        try {
            const result = await authApi.verifyEmailCode(formData.email, emailVerificationCode);

            setEmailCheck({
                status: 'verified',
                message: result
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '인증 확인 중 오류가 발생했습니다.';
            alert(errorMessage);
        }
    };

    // 🆕 아이디 입력 변경 시 중복확인 상태 초기화
    const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e);
        setUserIdCheck({ status: 'none', message: '' });
    };

    // 🆕 이메일 입력 변경 시 중복확인 상태 초기화
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e);
        setEmailCheck({ status: 'none', message: '' });
    };

    // 🆕 회원가입 함수 (중복확인 완료 체크 추가)
    async function handleSignup() {
        // 중복확인 완료 체크
        if (userIdCheck.status !== 'available') {
            alert('아이디 중복확인을 완료해주세요.');
            return;
        }

        if (emailCheck.status !== 'verified') {
            alert('이메일 인증을 완료해주세요.');
            return;
        }

        setIsSignupLoading(true);

        try {
            await authApi.signup(formData);
            alert("회원가입 성공!");
            onFlip();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "회원가입에 실패했습니다.";
            alert(errorMessage);
        } finally {
            setIsSignupLoading(false);
        }
    }

    // 🆕 회원가입 버튼 활성화 조건
    const isSignupDisabled =
        !isPasswordValid ||
        !isPasswordMatch ||
        !formData.userId ||
        !formData.email ||
        !formData.name ||
        userIdCheck.status !== 'available' ||
        emailCheck.status !== 'verified' ||
        isSignupLoading;

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

            {/* 🆕 아이디 (중복확인 기능 추가) */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">아이디</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        name="userId"
                        value={formData.userId}
                        onChange={handleUserIdChange}
                        placeholder="영문, 숫자 조합 4-12자"
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white/50 focus:outline-none focus:ring-2 focus:ring-[#356ae4]"
                    />
                    <button
                        type="button"
                        onClick={handleUserIdCheck}
                        disabled={userIdCheck.status === 'checking' || !formData.userId}
                        className="bg-slate-200 hover:bg-slate-300 disabled:opacity-50 px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1"
                    >
                        {userIdCheck.status === 'checking' && <Loader2 className="w-3 h-3 animate-spin" />}
                        중복확인
                    </button>
                </div>
                {/* 🆕 중복확인 결과 표시 */}
                {userIdCheck.message && (
                    <div className={`mt-1 text-xs flex items-center gap-1 ${
                        userIdCheck.status === 'available' ? 'text-green-600' :
                            userIdCheck.status === 'duplicate' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                        {userIdCheck.status === 'available' && <Check className="h-3 w-3" />}
                        {userIdCheck.status === 'duplicate' && <X className="h-3 w-3" />}
                        {userIdCheck.status === 'checking' && <Loader2 className="h-3 w-3 animate-spin" />}
                        <span>{userIdCheck.message}</span>
                    </div>
                )}
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

            {/* 🆕 이메일 (인증번호 발송 시 자동 중복확인) */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">이메일</label>
                <div className="flex gap-2">
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleEmailChange}
                        placeholder="example@email.com"
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white/50 focus:outline-none focus:ring-2 focus:ring-[#356ae4]"
                    />
                    <button
                        type="button"
                        onClick={handleEmailVerificationSend}
                        disabled={emailCheck.status === 'checking' || !formData.email}
                        className="bg-slate-200 hover:bg-slate-300 disabled:opacity-50 px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1"
                    >
                        {emailCheck.status === 'checking' && <Loader2 className="w-3 h-3 animate-spin" />}
                        인증번호
                    </button>
                </div>
                {/* 🆕 중복확인 및 인증 결과 표시 */}
                {emailCheck.message && (
                    <div className={`mt-1 text-xs flex items-center gap-1 ${
                        emailCheck.status === 'available' || emailCheck.status === 'sent' || emailCheck.status === 'verified' ? 'text-green-600' :
                            emailCheck.status === 'duplicate' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                        {(emailCheck.status === 'available' || emailCheck.status === 'sent' || emailCheck.status === 'verified') && <Check className="h-3 w-3" />}
                        {emailCheck.status === 'duplicate' && <X className="h-3 w-3" />}
                        {emailCheck.status === 'checking' && <Loader2 className="h-3 w-3 animate-spin" />}
                        <span>{emailCheck.message}</span>
                    </div>
                )}
                {/* 🆕 인증번호 입력 필드 (인증번호 발송 후 표시) */}
                {emailCheck.status === 'sent' && (
                    <div className="mt-2">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={emailVerificationCode}
                                onChange={(e) => setEmailVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="인증번호 6자리"
                                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white/50 focus:outline-none focus:ring-2 focus:ring-[#356ae4]"
                                maxLength={6}
                            />
                            <button
                                type="button"
                                onClick={handleEmailVerificationCheck}
                                disabled={emailVerificationCode.length !== 6}
                                className="bg-[#356ae4] hover:bg-[#2857c8] text-white px-3 py-2 rounded-lg text-xs font-semibold disabled:opacity-50"
                            >
                                확인
                            </button>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            인증번호가 전송되었습니다. 이메일을 확인해주세요.
                        </p>
                    </div>
                )}
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

            {/* 🆕 회원가입 버튼 (중복확인 완료 체크 추가) */}
            <button
                onClick={handleSignup}
                disabled={isSignupDisabled}
                className="bg-[#356ae4] hover:bg-[#2857c8] text-white py-3 rounded-lg font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {isSignupLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSignupLoading ? '회원가입 중...' : '회원가입'}
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
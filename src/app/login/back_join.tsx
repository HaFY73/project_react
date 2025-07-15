"use client"

import React, {useState} from "react"
import {Eye, EyeOff, Check, X, Loader2} from "lucide-react"
import {authApi} from "@/lib/auth-api"

interface SignupFormProps {
    formData: {
        userId: string
        name: string,
        password: string
        confirmPassword: string
        phone: string
        email: string
        interests: string[]
    },
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    onInterestChange: (val: string) => void,
    showPassword: boolean,
    showConfirmPassword: boolean,
    setShowPassword: (v: boolean) => void,
    setShowConfirmPassword: (v: boolean) => void,
    onFlip: () => void
}

const interests = [
    "경영/기획/전략", "디자인/컨텐츠", "개발/IT", "마케팅/브랜딩",
    "영업/고객관리", "교육/강의/연구", "운영/사무관리", "생산/물류/품질관리",
    "사회/공공기관", "특수직"
]

function PasswordCheck({ok, label}: { ok: boolean; label: string }) {
    return (
        <div className="flex items-center gap-2">
            {ok ? <Check className="h-3 w-3 text-green-500"/> : <X className="h-3 w-3 text-red-500"/>}
            <span className={ok ? "text-green-600" : "text-red-600"}>{label}</span>
        </div>
    )
}

export default function SignupForm({
                                       formData, onChange, onInterestChange,
                                       showPassword, showConfirmPassword,
                                       setShowPassword, setShowConfirmPassword, onFlip
                                   }: SignupFormProps) {

    // 비밀번호 검사
    const isPasswordValid =
        formData.password.length >= 8 &&
        /[a-zA-Z]/.test(formData.password) &&
        /\d/.test(formData.password) &&
        /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);

    const isPasswordMatch = formData.password === formData.confirmPassword;

    // ====== 첫번째 기능들 가져옴 ======
    const [userIdCheck, setUserIdCheck] = useState({status: 'none' as any, message: ''});
    const [emailCheck, setEmailCheck] = useState({status: 'none' as any, message: ''});
    const [emailVerificationCode, setEmailVerificationCode] = useState('');
    const [isSignupLoading, setIsSignupLoading] = useState(false);

    const formatPhoneNumber = (value: string) => {
        const numbers = value.replace(/[^\d]/g, '').slice(0, 11);
        return numbers.length <= 3 ? numbers :
            numbers.length <= 7 ? `${numbers.slice(0,3)}-${numbers.slice(3)}` :
                `${numbers.slice(0,3)}-${numbers.slice(3,7)}-${numbers.slice(7)}`
    }
    const validatePhoneNumber = (phone: string) => /^(010|011|016|017|018|019)\d{7,8}$/.test(phone.replace(/[^\d]/g, ''));

    const handleUserIdCheck = async () => {
        if (!formData.userId || formData.userId.trim().length < 4) {
            setUserIdCheck({status: 'error', message: '아이디는 4자 이상 입력해주세요.'});
            return;
        }
        setUserIdCheck({status: 'checking', message: '확인 중...'});
        try {
            const isDuplicate = await authApi.checkUserIdDuplicate(formData.userId);
            setUserIdCheck({
                status: isDuplicate ? 'duplicate' : 'available',
                message: isDuplicate ? '이미 사용중인 아이디입니다.' : '사용 가능한 아이디입니다.'
            })
        } catch {
            setUserIdCheck({status: 'error', message: '확인 중 오류가 발생했습니다.'});
        }
    }
    const handleEmailVerificationSend = async () => {
        if (!formData.email || !formData.email.includes('@')) {
            setEmailCheck({status: 'error', message: '올바른 이메일을 입력해주세요.'});
            return;
        }
        setEmailCheck({status: 'checking', message: '이메일 확인 중...'});
        try {
            const isDuplicate = await authApi.checkEmailDuplicate(formData.email);
            if (isDuplicate) {
                setEmailCheck({status: 'duplicate', message: '이미 가입된 이메일입니다.'});
                return;
            }
            const result = await authApi.sendEmailVerificationCode(formData.email);
            setEmailCheck({status: 'sent', message: result});
        } catch {
            setEmailCheck({status: 'error', message: '오류가 발생했습니다.'});
        }
    }
    const handleEmailVerificationCheck = async () => {
        if (!emailVerificationCode || emailVerificationCode.length !== 6) {
            alert('인증번호 6자리를 입력해주세요.');
            return;
        }
        try {
            const result = await authApi.verifyEmailCode(formData.email, emailVerificationCode);
            setEmailCheck({status: 'verified', message: result});
        } catch {
            alert('인증 확인 중 오류가 발생했습니다.');
        }
    }

    const handleSignup = async () => {
        if (userIdCheck.status !== 'available') return alert('아이디 중복확인을 완료해주세요.');
        if (emailCheck.status !== 'verified') return alert('이메일 인증을 완료해주세요.');
        setIsSignupLoading(true);
        try {
            await authApi.signup(formData);
            alert("회원가입 성공!");
            onFlip();
        } catch {
            alert("회원가입에 실패했습니다.");
        } finally {
            setIsSignupLoading(false);
        }
    }

    return (
        <div className="w-[650px] h-[90vh] bg-white/90 backdrop-blur-sm p-5 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
             style={{backfaceVisibility: "hidden"}}>
            <h2 className="text-2xl font-bold text-center text-[#8b5cf6] mb-6">회원가입</h2>

            <div className="flex-1 overflow-y-auto pr-4"
                 style={{scrollbarWidth: "thin", scrollbarColor: "rgba(100,100,100,0.3) transparent"}}>
                {/* 이름 */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">이름</label>
                    <input type="text" name="name" value={formData.name} onChange={onChange}
                           className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white/50 focus:outline-none focus:border-[#8b5cf6]"/>
                </div>

                {/* 아이디 */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">아이디</label>
                    <div className="flex gap-2">
                        <input type="text" name="userId" value={formData.userId}
                               onChange={e => {onChange(e); setUserIdCheck({status: 'none', message: ''})}}
                               className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white/50 focus:outline-none focus:border-[#8b5cf6]"/>
                        <button type="button" onClick={handleUserIdCheck}
                                className="bg-[#6366f1] text-white hover:bg-[#8b5cf6] px-3 py-2 rounded-lg text-xs font-medium">
                            중복확인
                        </button>
                    </div>
                    {userIdCheck.message && (
                        <div className={`mt-1 text-xs flex items-center gap-1 ${
                            userIdCheck.status==='available'?'text-green-600':userIdCheck.status==='duplicate'?'text-red-600':'text-gray-600'}`}>
                            {userIdCheck.status==='available'&&<Check className="h-3 w-3"/>}
                            {userIdCheck.status==='duplicate'&&<X className="h-3 w-3"/>}
                            <span>{userIdCheck.message}</span>
                        </div>
                    )}
                </div>

                {/* 비밀번호 */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">비밀번호</label>
                    <div className="relative">
                        <input type={showPassword ? "text" : "password"} name="password"
                               value={formData.password} onChange={onChange}
                               className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg text-sm bg-white/50 focus:outline-none focus:border-[#8b5cf6]"/>
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            {showPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                        </button>
                    </div>
                    {formData.password && (
                        <div className="mt-2 space-y-1 text-xs">
                            <PasswordCheck ok={formData.password.length >= 8} label="8자 이상"/>
                            <PasswordCheck ok={/[a-zA-Z]/.test(formData.password)&&/\d/.test(formData.password)&&/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)}
                                           label="영문, 숫자, 특수문자 포함"/>
                        </div>
                    )}
                </div>

                {/* 비밀번호 확인 */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">비밀번호 확인</label>
                    <div className="relative">
                        <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword"
                               value={formData.confirmPassword} onChange={onChange}
                               className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg text-sm bg-white/50 focus:outline-none focus:border-[#8b5cf6]"/>
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            {showConfirmPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                        </button>
                    </div>
                    {formData.confirmPassword && (
                        <div className="mt-1 text-xs flex items-center gap-2">
                            {isPasswordMatch ? <><Check className="h-3 w-3 text-green-500"/><span className="text-green-600">비밀번호가 일치합니다</span></> :
                                <><X className="h-3 w-3 text-red-500"/><span className="text-red-600">비밀번호가 일치하지 않습니다</span></>}
                        </div>
                    )}
                </div>

                {/* 휴대폰 번호 */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">휴대폰 번호</label>
                    <input type="text" name="phone" value={formData.phone}
                           onChange={e => onChange({...e, target:{...e.target,name:'phone',value:formatPhoneNumber(e.target.value)}})}
                           placeholder="010-1234-5678"
                           className={`w-full px-3 py-2 border rounded-lg text-sm bg-white/50 focus:outline-none 
                           ${formData.phone && !validatePhoneNumber(formData.phone)?'border-red-300 focus:border-red-500':'border-slate-300 focus:border-[#8b5cf6]'}`}/>
                    {formData.phone && (
                        <div className="mt-1 text-xs">
                            {validatePhoneNumber(formData.phone) ? <span className="text-green-600">✓ 올바른 형식입니다</span>
                                : <span className="text-red-600">올바른 번호를 입력해주세요 (010-xxxx-xxxx)</span>}
                        </div>
                    )}
                </div>

                {/* 이메일 */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">이메일</label>
                    <div className="flex gap-2">
                        <input type="email" name="email" value={formData.email}
                               onChange={e => {onChange(e); setEmailCheck({status:'none',message:''})}}
                               className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white/50 focus:outline-none focus:border-[#8b5cf6]"/>
                        <button type="button" onClick={handleEmailVerificationSend}
                                className="bg-[#6366f1] text-white hover:bg-[#8b5cf6] px-3 py-2 rounded-lg text-xs font-medium">
                            인증번호
                        </button>
                    </div>
                    {emailCheck.message && (
                        <div className={`mt-1 text-xs flex items-center gap-1 ${
                            emailCheck.status==='verified'?'text-green-600':emailCheck.status==='duplicate'?'text-red-600':'text-gray-600'}`}>
                            {emailCheck.status==='verified'&&<Check className="h-3 w-3"/>}
                            {emailCheck.status==='duplicate'&&<X className="h-3 w-3"/>}
                            <span>{emailCheck.message}</span>
                        </div>
                    )}
                    {emailCheck.status==='sent' && (
                        <div className="mt-2 flex gap-2">
                            <input type="text" value={emailVerificationCode}
                                   onChange={e=>setEmailVerificationCode(e.target.value.replace(/\D/g,'').slice(0,6))}
                                   placeholder="인증번호 6자리"
                                   className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white/50 focus:outline-none focus:border-[#8b5cf6]"/>
                            <button type="button" onClick={handleEmailVerificationCheck}
                                    className="bg-[#6366f1] text-white hover:bg-[#8b5cf6] px-3 py-2 rounded-lg text-xs font-medium">
                                확인
                            </button>
                        </div>
                    )}
                </div>

                {/* 관심분야 */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-3">관심 분야 (복수 선택 가능)</label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        {interests.map((interest, idx) => (
                            <label key={idx}
                                   className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors 
                                   ${formData.interests.includes(interest)?"bg-[#6366f1]/10 border border-[#6366f1]/30":"hover:bg-slate-50 border border-slate-200"}`}>
                                <input type="checkbox" checked={formData.interests.includes(interest)}
                                       onChange={()=>onInterestChange(interest)}
                                       className="mr-2 h-3 w-3 text-[#6366f1] focus:border-[#8b5cf6] rounded"/>
                                <span className="text-slate-700">{interest}</span>
                            </label>
                        ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">선택: {formData.interests.length}개</p>
                </div>

                {/* 버튼 */}
                <button onClick={handleSignup} disabled={!isPasswordValid||!isPasswordMatch||!formData.userId||!formData.email||isSignupLoading}
                        className="w-full bg-[#6366f1] hover:bg-[#8b5cf6] text-white py-3 rounded-lg font-semibold disabled:opacity-50 flex justify-center items-center gap-2">
                    {isSignupLoading && <Loader2 className="w-4 h-4 animate-spin"/>}
                    {isSignupLoading?'회원가입 중...':'회원가입'}
                </button>

                <div className="text-center mt-3 text-sm">
                    <span className="text-slate-600">이미 계정이 있으신가요? </span>
                    <span className="text-[#8b5cf6] cursor-pointer hover:underline font-semibold" onClick={onFlip}>로그인</span>
                </div>
            </div>
        </div>
    )
}

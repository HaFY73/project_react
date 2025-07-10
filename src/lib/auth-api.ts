// lib/auth-api.ts
const API_BASE_URL = 'http://localhost:8080/api';

export const authApi = {
    /**
     * 아이디 중복 확인
     * @param userId 확인할 아이디
     * @returns 중복이면 true, 사용 가능하면 false
     */
    checkUserIdDuplicate: async (userId: string): Promise<boolean> => {
        try {
            const response = await fetch(`${API_BASE_URL}/check-userid/${encodeURIComponent(userId)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                if (response.status === 400) {
                    const errorText = await response.text();
                    throw new Error(errorText || '잘못된 요청입니다.');
                }
                throw new Error('아이디 중복 확인 중 오류가 발생했습니다.');
            }

            return await response.json();
        } catch (error) {
            console.error('아이디 중복 확인 실패:', error);
            throw error;
        }
    },

    /**
     * 이메일 중복 확인
     * @param email 확인할 이메일
     * @returns 중복이면 true, 사용 가능하면 false
     */
    checkEmailDuplicate: async (email: string): Promise<boolean> => {
        try {
            const response = await fetch(`${API_BASE_URL}/check-email/${encodeURIComponent(email)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                if (response.status === 400) {
                    const errorText = await response.text();
                    throw new Error(errorText || '잘못된 요청입니다.');
                }
                throw new Error('이메일 중복 확인 중 오류가 발생했습니다.');
            }

            return await response.json();
        } catch (error) {
            console.error('이메일 중복 확인 실패:', error);
            throw error;
        }
    },

    /**
     * 회원가입
     */
    signup: async (signupData: any) => {
        try {
            const response = await fetch(`${API_BASE_URL}/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(signupData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || '회원가입에 실패했습니다.');
            }

            return await response.text();
        } catch (error) {
            console.error('회원가입 실패:', error);
            throw error;
        }
    },

    /**
     * 로그인
     */
    login: async (loginData: any) => {
        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || '로그인에 실패했습니다.');
            }

            return await response.json();
        } catch (error) {
            console.error('로그인 실패:', error);
            throw error;
        }
    }
};
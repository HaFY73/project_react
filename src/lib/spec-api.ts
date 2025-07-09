// src/lib/spec-api.ts

const BASE_URL = 'http://localhost:8080/api';

// =============================================================================
// 타입 정의 (프론트엔드/백엔드 DTO 포함)
// =============================================================================

export interface SpecApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// --- 백엔드 DTO 타입 ---
interface BackendSpecSkillDto {
  id?: number;
  name: string;
  category: string;
  level: number;
  displayOrder: number;
}
// ... 다른 백엔드 DTO들도 필요시 정의 ...

// --- 프론트엔드 데이터 모델 ---
export interface SpecProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  careerLevel: string;
  jobTitle: string;
  introduction: string;
}

export interface SpecCareerStats {
  experience: string;
  workRecords: string;
  careerGoal: string;
}

export interface SpecWorkExperience {
  id?: number;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface SpecEducation {
  id?: number;
  school: string;
  major: string;
  degree: string;
  startDate: string;
  endDate: string;
}

export interface SpecCertificate {
  id?: number;
  name: string;
  issuer: string; // 백엔드 DTO에서는 organization
  acquisitionDate: string;
}

export interface SpecLink {
  id?: number;
  title: string;
  url: string;
}

export interface SpecLanguage {
  id?: number;
  language: string;
  level: string;
}

export interface SpecProject {
  id?: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
}

export interface SpecActivity {
  id?: number;
  name: string;
  organization: string;
  startDate: string;
  endDate: string;
}

export interface SpecMilitary {
  id?: number;
  serviceType: string;
  militaryBranch: string;
  startDate: string;
  endDate: string;
}

// --- fetchUserSpec이 최종적으로 반환할 데이터 형태 ---
export interface UserSpecData {
  profile: SpecProfile;
  careerStats: SpecCareerStats;
  skills: string[]; // 🔥 객체 배열이 아닌 문자열 배열
  workExperiences: SpecWorkExperience[];
  educations: SpecEducation[];
  certificates: SpecCertificate[];
  links: SpecLink[];
  languages: SpecLanguage[];
  projects: SpecProject[];
  activities: SpecActivity[];
  military: SpecMilitary[];
}


// =============================================================================
// HTTP 클라이언트
// =============================================================================

const apiCall = async <T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<SpecApiResponse<T>> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
  const responseBody = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    throw new Error(responseBody.message || `API 호출 실패: ${response.status}`);
  }
  return responseBody;
};


// =============================================================================
// 데이터 변환 함수
// =============================================================================

// 백엔드 데이터를 프론트엔드가 사용하기 좋은 형태로 변환
const transformBackendData = (backendData: any): UserSpecData => {
  return {
    profile: backendData.profile || { name: "", email: "", phone: "", location: "", careerLevel: "", jobTitle: "", introduction: "" },
    careerStats: backendData.careerStats || { experience: "", workRecords: "", careerGoal: "" },
    // 🔥 스킬 객체 배열을 이름(문자열) 배열로 변환
    skills: (backendData.skills || []).map((skill: BackendSpecSkillDto) => skill.name),
    workExperiences: (backendData.workExperiences || []).map((exp: any) => ({ ...exp, issuer: exp.organization })),
    educations: backendData.educations || [],
    certificates: (backendData.certificates || []).map((cert: any) => ({ ...cert, issuer: cert.organization })),
    links: backendData.links || [],
    languages: backendData.languages || [],
    projects: backendData.projects || [],
    activities: backendData.activities || [],
    military: backendData.militaries || [],
  };
};


// =============================================================================
// 스펙 API 함수들 (생략 없음)
// =============================================================================

export const fetchUserSpec = async (userId: number): Promise<UserSpecData> => {
  const result = await apiCall<any>(`/spec/${userId}`);
  if (!result.success) throw new Error(result.message || '스펙 데이터를 불러오는데 실패했습니다.');
  // 🔥 백엔드 데이터를 프론트엔드 형태로 변환 후 반환
  return transformBackendData(result.data);
};

export const updateProfile = async (userId: number, profileData: SpecProfile): Promise<any> => {
  const result = await apiCall(`/spec/${userId}/profile`, {
    method: 'PUT', body: JSON.stringify(profileData),
  });
  if (!result.success) throw new Error(result.message || '프로필 업데이트에 실패했습니다.');
  return result.data;
};

export const updateSkills = async (userId: number, skills: string[]): Promise<string[]> => {
  const result = await apiCall<string[]>(`/spec/${userId}/skills`, {
    method: 'PUT', body: JSON.stringify(skills),
  });
  if (!result.success) throw new Error(result.message || '스킬 업데이트에 실패했습니다.');
  return result.data;
};

export const updateWorkExperiences = async (userId: number, experiences: SpecWorkExperience[]): Promise<any> => {
  const result = await apiCall(`/spec/${userId}/careers`, {
    method: 'PUT', body: JSON.stringify(experiences),
  });
  if (!result.success) throw new Error(result.message || '업무 경력 업데이트에 실패했습니다.');
  return result.data;
};

export const updateEducations = async (userId: number, educations: SpecEducation[]): Promise<any> => {
  const result = await apiCall(`/spec/${userId}/educations`, {
    method: 'PUT', body: JSON.stringify(educations),
  });
  if (!result.success) throw new Error(result.message || '학력 업데이트에 실패했습니다.');
  return result.data;
};

export const updateCertificates = async (userId: number, certificates: SpecCertificate[]): Promise<any> => {
  const backendCerts = certificates.map(cert => ({...cert, organization: cert.issuer }));
  const result = await apiCall(`/spec/${userId}/certificates`, {
    method: 'PUT', body: JSON.stringify(backendCerts),
  });
  if (!result.success) throw new Error(result.message || '자격증 업데이트에 실패했습니다.');
  return result.data;
};

export const updateLinks = async (userId: number, links: SpecLink[]): Promise<any> => {
  const result = await apiCall(`/spec/${userId}/links`, {
    method: 'PUT', body: JSON.stringify(links),
  });
  if (!result.success) throw new Error(result.message || '링크 업데이트에 실패했습니다.');
  return result.data;
};

export const updateLanguages = async (userId: number, languages: SpecLanguage[]): Promise<any> => {
  const result = await apiCall(`/spec/${userId}/languages`, {
    method: 'PUT', body: JSON.stringify(languages),
  });
  if (!result.success) throw new Error(result.message || '어학 정보 업데이트에 실패했습니다.');
  return result.data;
};

export const updateProjects = async (userId: number, projects: SpecProject[]): Promise<any> => {
  const result = await apiCall(`/spec/${userId}/projects`, {
    method: 'PUT', body: JSON.stringify(projects),
  });
  if (!result.success) throw new Error(result.message || '프로젝트 업데이트에 실패했습니다.');
  return result.data;
};

export const updateActivities = async (userId: number, activities: SpecActivity[]): Promise<any> => {
  const result = await apiCall(`/spec/${userId}/activities`, {
    method: 'PUT', body: JSON.stringify(activities),
  });
  if (!result.success) throw new Error(result.message || '활동 정보 업데이트에 실패했습니다.');
  return result.data;
};

export const updateMilitary = async (userId: number, military: SpecMilitary[]): Promise<any> => {
  const result = await apiCall(`/spec/${userId}/militaries`, {
    method: 'PUT', body: JSON.stringify(military),
  });
  if (!result.success) throw new Error(result.message || '병역 정보 업데이트에 실패했습니다.');
  return result.data;
};

export const updateCareerStats = async (userId: number, stats: SpecCareerStats): Promise<any> => {
  const result = await apiCall(`/spec/${userId}/career-stats`, {
    method: 'PUT', body: JSON.stringify(stats),
  });
  if (!result.success) throw new Error(result.message || '경력 통계 업데이트에 실패했습니다.');
  return result.data;
};
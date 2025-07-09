const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getAuthHeaders(): Record<string, string> {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('로그인이 필요합니다.');
    }

    return {
      'X-User-ID': userId,
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async createCoverLetter(data: CoverLetterRequest) {
    const requestData = {
      title: data.title,
      isDraft: data.isDraft,
      questions: data.questions.map(q => ({
        title: q.title,
        content: q.content,
        wordLimit: 500,
      })),
    };

    return this.request<CoverLetterResponse>('/cover-letters', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  async updateCoverLetter(id: number, data: CoverLetterRequest) {
    const requestData = {
      title: data.title,
      isDraft: data.isDraft,
      questions: data.questions.map(q => ({
        title: q.title,
        content: q.content,
        wordLimit: 500,
      })),
    };

    return this.request<CoverLetterResponse>(`/cover-letters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(requestData),
    });
  }

  async getCoverLetters() {
    return this.request<CoverLetterResponse[]>('/cover-letters');
  }

  async getCoverLetter(id: number) {
    return this.request<CoverLetterResponse>(`/cover-letters/${id}`);
  }

  async deleteCoverLetter(id: number) {
    return this.request<void>(`/cover-letters/${id}`, {
      method: 'DELETE',
    });
  }

  async healthCheck() {
    return this.request<Record<string, unknown>>('/health');
  }
}

export interface CoverLetterRequest {
  title: string;
  isDraft: boolean;
  questions: QuestionRequest[];
}

export interface QuestionRequest {
  id: string;
  title: string;
  content: string;
}

export interface CoverLetterResponse {
  id: number;
  title: string;
  isDraft: boolean;
  questions: QuestionResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface QuestionResponse {
  id: number;
  title: string;
  content: string;
  wordLimit: number;
  createdAt: string;
  updatedAt: string;
}

export const apiClient = new ApiClient(API_BASE_URL);

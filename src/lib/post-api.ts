import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8081/api",
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

// 게시글 API
export const getPosts = () => api.get("/posts")

export const getPostById = (id: number) => api.get(`/posts/${id}`);

export const createPost = (data: {
    title: string;
    content: string;
    category: string;
    hashtags: string;
    imageUrl: string;
    user: { id: number };
}) => api.post("/posts", data);

export const updatePost = (id: number, data: any) => api.put(`/posts/${id}`, data);

export const deletePost = (id: number) => api.delete(`/posts/${id}`);

export const getPostsByCategory = (category: string) => api.get(`/posts/category/${category}`)

export const searchPosts = (query: string) => api.get(`/posts/search?q=${query}`)

export const getFollowingPosts = (userId: number) => api.get(`/posts/following/${userId}`)

// 좋아요 토글
export const toggleLike = (postId: number, userId: number) =>
    api.post(`/posts/${postId}/likes?userId=${userId}`);

// 팔로우 토글
export const toggleFollow = (followerId: number, followingId: number) =>
    api.post(`/follows?followerId=${followerId}&followingId=${followingId}`);

// 댓글달기
export const addComment = (postId: number, userId: number, content: string) =>
    api.post(`/posts/${postId}/comments`, { userId, content })
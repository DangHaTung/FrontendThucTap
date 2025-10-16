import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Comment {
  _id: string;
  cardId: string;
  author: {
    _id: string;
    username: string;
    email: string;
  };
  text: string;
  createdAt: string;
  updatedAt: string;
}

export const commentsApi = {
  // Get all comments for a card
  getCommentsByCard: async (cardId: string): Promise<Comment[]> => {
    const response = await api.get(`/comments/${cardId}`);
    return response.data;
  },

  // Create a new comment
  createComment: async (cardId: string, text: string): Promise<Comment> => {
    const response = await api.post(`/comments/${cardId}`, { text });
    return response.data;
  },

  // Update a comment
  updateComment: async (commentId: string, text: string): Promise<Comment> => {
    const response = await api.put(`/comments/${commentId}`, { text });
    return response.data;
  },

  // Delete a comment
  deleteComment: async (commentId: string): Promise<void> => {
    await api.delete(`/comments/${commentId}`);
  },
};

export default commentsApi;

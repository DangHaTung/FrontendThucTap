import api from './authApi';

export interface Comment {
  _id: string;
  content: string;
  cardId: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentRequest {
  content: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export const commentsApi = {
  // Lấy danh sách comments của card
  getComments: async (cardId: string): Promise<Comment[]> => {
    const response = await api.get(`/cards/${cardId}/comments`);
    return response.data;
  },

  // Tạo comment mới
  createComment: async (cardId: string, data: CreateCommentRequest): Promise<Comment> => {
    const response = await api.post(`/cards/${cardId}/comments`, data);
    return response.data;
  },

  // Cập nhật comment
  updateComment: async (commentId: string, data: UpdateCommentRequest): Promise<Comment> => {
    const response = await api.put(`/comments/${commentId}`, data);
    return response.data;
  },

  // Xóa comment
  deleteComment: async (commentId: string): Promise<void> => {
    await api.delete(`/comments/${commentId}`);
  }
};


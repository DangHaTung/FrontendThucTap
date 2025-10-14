import api from './index';

export interface Card {
  _id: string;
  title: string;
  description: string;
  listId: string;
  position: number;
  createdBy: string;
  assignees: string[];
  labels: string[];
  dueDate: string | null;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCardRequest {
  title: string;
  description?: string;
  labels?: string[];
  dueDate?: string;
  color?: string;
}

export interface UpdateCardRequest {
  title?: string;
  description?: string;
  labels?: string[];
  assignees?: string[];
  dueDate?: string;
  color?: string;
}

export interface MoveCardRequest {
  targetListId: string;
  targetPosition: number;
}

export const cardsApi = {
  // Lấy danh sách cards của list
  getCardsByList: async (listId: string): Promise<Card[]> => {
    const response = await api.get(`/lists/${listId}/cards`);
    return response.data;
  },

  // Tạo card mới
  createCard: async (boardId: string, listId: string, data: CreateCardRequest): Promise<Card> => {
    const response = await api.post(`/boards/${boardId}/lists/${listId}/cards`, data);
    return response.data;
  },

  // Cập nhật card
  updateCard: async (cardId: string, data: UpdateCardRequest): Promise<Card> => {
    const response = await api.put(`/cards/${cardId}`, data);
    return response.data;
  },

  // Cập nhật màu sắc card
  updateCardColor: async (cardId: string, color: string): Promise<Card> => {
    const response = await api.put(`/cards/${cardId}`, { color });
    return response.data;
  },

  // Xóa card
  deleteCard: async (cardId: string): Promise<void> => {
    await api.delete(`/cards/${cardId}`);
  },

  // Di chuyển card
  moveCard: async (cardId: string, data: MoveCardRequest): Promise<Card> => {
    const response = await api.post(`/cards/${cardId}/move`, data);
    return response.data;
  }
};


import api from './index';

export interface List {
  _id: string;
  title: string;
  boardId: string;
  position: number;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateListRequest {
  title: string;
  color?: string;
}

export interface UpdateListRequest {
  title?: string;
  color?: string;
}

export const listsApi = {
  // Lấy danh sách lists của board
  getListsByBoard: async (boardId: string): Promise<List[]> => {
    const response = await api.get(`/boards/${boardId}/lists`);
    return response.data;
  },

  // Tạo list mới
  createList: async (boardId: string, data: CreateListRequest): Promise<List> => {
    const response = await api.post(`/boards/${boardId}/lists`, data);
    return response.data;
  },

  // Cập nhật list
  updateList: async (boardId: string, listId: string, data: UpdateListRequest): Promise<List> => {
    const response = await api.put(`/boards/${boardId}/lists/${listId}`, data);
    return response.data;
  },

  // Cập nhật màu sắc list
  updateListColor: async (boardId: string, listId: string, color: string): Promise<List> => {
    const response = await api.put(`/boards/${boardId}/lists/${listId}`, { color });
    return response.data;
  },

  // Xóa list
  deleteList: async (boardId: string, listId: string): Promise<void> => {
    await api.delete(`/boards/${boardId}/lists/${listId}`);
  }
};


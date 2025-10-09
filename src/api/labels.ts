import api from './index';

export interface Label {
  _id: string;
  title: string;
  color: string;
  boardId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLabelRequest {
  title: string;
  color: string;
}

export interface UpdateLabelRequest {
  title?: string;
  color?: string;
}

export interface AttachLabelRequest {
  labelId: string;
}

export const labelsApi = {
  // Lấy danh sách labels của board
  getLabels: async (boardId: string): Promise<Label[]> => {
    const response = await api.get(`/boards/${boardId}/labels`);
    return response.data;
  },

  // Tạo label mới
  createLabel: async (boardId: string, data: CreateLabelRequest): Promise<Label> => {
    const response = await api.post(`/boards/${boardId}/labels`, data);
    return response.data;
  },

  // Cập nhật label
  updateLabel: async (labelId: string, data: UpdateLabelRequest): Promise<Label> => {
    const response = await api.put(`/labels/${labelId}`, data);
    return response.data;
  },

  // Xóa label
  deleteLabel: async (labelId: string): Promise<void> => {
    await api.delete(`/labels/${labelId}`);
  },

  // Gắn label vào card
  attachLabelToCard: async (cardId: string, data: AttachLabelRequest): Promise<void> => {
    await api.post(`/cards/${cardId}/labels`, data);
  },

  // Gỡ label khỏi card
  detachLabelFromCard: async (cardId: string, labelId: string): Promise<void> => {
    await api.delete(`/cards/${cardId}/labels`, {
      data: { labelId }
    });
  }
};


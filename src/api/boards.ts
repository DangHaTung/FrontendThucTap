import api from './authApi';

export interface Board {
  _id: string;
  title: string;
  owner: string;
  members: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateBoardRequest {
  title: string;
}

export interface BoardInvitation {
  _id: string;
  boardId: string;
  email: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export const boardsApi = {
  // Lấy danh sách boards của user hiện tại
  getMyBoards: async (): Promise<Board[]> => {
    const response = await api.get('/boards');
    return response.data;
  },

  // Tạo board mới
  createBoard: async (data: CreateBoardRequest): Promise<Board> => {
    const response = await api.post('/boards', data);
    return response.data;
  },

  // Lấy board theo ID
  getBoardById: async (id: string): Promise<Board> => {
    const response = await api.get(`/boards/${id}`);
    return response.data;
  },

  // Cập nhật board
  updateBoard: async (id: string, data: { title: string }): Promise<Board> => {
    const response = await api.put(`/boards/${id}`, data);
    return response.data;
  },

  // Xóa board
  deleteBoard: async (id: string): Promise<void> => {
    await api.delete(`/boards/${id}`);
  },

  // Mời thành viên
  inviteMember: async (boardId: string, memberId: string): Promise<Board> => {
    const response = await api.post(`/boards/${boardId}/invite`, { memberId });
    return response.data;
  },

  // Mời thành viên bằng email
  inviteMemberByEmail: async (boardId: string, email: string): Promise<Board> => {
    const response = await api.post(`/boards/${boardId}/invite-by-email`, { email });
    return response.data;
  },

  // Xóa thành viên
  removeMember: async (boardId: string, memberId: string): Promise<Board> => {
    const response = await api.post(`/boards/${boardId}/remove-member`, { memberId });
    return response.data;
  },

  // Rời khỏi board
  leaveBoard: async (boardId: string): Promise<Board> => {
    const response = await api.post(`/boards/${boardId}/leave`);
    return response.data;
  },

  // Lấy danh sách lời mời của user hiện tại
  getMyInvitations: async (): Promise<BoardInvitation[]> => {
    const response = await api.get('/boards/invitations');
    return response.data;
  },

  // Chấp nhận lời mời
  acceptInvitation: async (boardId: string, invitationId: string): Promise<void> => {
    await api.post(`/boards/${boardId}/invitations/${invitationId}/accept`);
  },

  // Từ chối lời mời
  rejectInvitation: async (boardId: string, invitationId: string): Promise<void> => {
    await api.post(`/boards/${boardId}/invitations/${invitationId}/reject`);
  },
};


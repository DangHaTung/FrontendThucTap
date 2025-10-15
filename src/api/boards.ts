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
  inviterId: any;
  message: ReactNode;
  _id: string;
  boardId: string;
  email: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface InviteResponse {
  message: string;
  invitation: BoardInvitation;
}

export interface InvitationAcceptResponse {
  message: string;
  board: Board;
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

  // Lấy board theo ID (alias)
  getBoard: async (id: string): Promise<Board> => {
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
  inviteMemberByEmail: async (boardId: string, email: string): Promise<InviteResponse> => {
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
    const response = await api.get('/invitations');
    return response.data;
  },

  // Chấp nhận lời mời
  acceptInvitation: async (invitationId: string): Promise<InvitationAcceptResponse> => {
    const response = await api.post(`/invitations/${invitationId}/accept`);
    return response.data;
  },

  // Từ chối lời mời
  rejectInvitation: async (invitationId: string): Promise<{ message: string }> => {
    const response = await api.post(`/invitations/${invitationId}/reject`);
    return response.data;
  },
};



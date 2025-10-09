import api from './index';
import { Board } from './boards';
import { Card } from './cards';

export interface SearchBoardsRequest {
  query: string;
  limit?: number;
  offset?: number;
}

export interface SearchCardsRequest {
  query: string;
  boardId?: string;
  listId?: string;
  limit?: number;
  offset?: number;
}

export interface SearchBoardsResponse {
  boards: Board[];
  total: number;
  limit: number;
  offset: number;
}

export interface SearchCardsResponse {
  cards: Card[];
  total: number;
  limit: number;
  offset: number;
}

export const searchApi = {
  // Tìm kiếm boards
  searchBoards: async (params: SearchBoardsRequest): Promise<SearchBoardsResponse> => {
    const response = await api.get('/search/boards', { params });
    return response.data;
  },

  // Tìm kiếm cards
  searchCards: async (params: SearchCardsRequest): Promise<SearchCardsResponse> => {
    const response = await api.get('/search/cards', { params });
    return response.data;
  }
};


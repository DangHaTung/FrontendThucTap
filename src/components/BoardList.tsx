import React, { useState, useEffect } from 'react';
import { Plus, Grid, Trash2, Edit3 } from 'lucide-react';
import { boardsApi, type Board } from '../api/boards';
import { useAuth } from '../contexts/AuthContext';

interface BoardListProps {
  onBoardSelect: (boardId: string) => void;
}

export default function BoardList({ onBoardSelect }: BoardListProps) {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [showNewBoard, setShowNewBoard] = useState(false);
  const [editingBoard, setEditingBoard] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const { username } = useAuth();

  useEffect(() => {
    loadBoards();
  }, []);

  const loadBoards = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const boardsData = await boardsApi.getMyBoards();
      setBoards(boardsData);
    } catch (err: any) {
      console.error('Error loading boards:', err);
      setError(`Có lỗi xảy ra khi tải danh sách bảng: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createBoard = async () => {
    if (!newBoardTitle.trim()) return;
    
    try {
      const newBoard = await boardsApi.createBoard({
        title: newBoardTitle
      });
      
      setBoards([...boards, newBoard]);
      setNewBoardTitle('');
      setShowNewBoard(false);
    } catch (err: any) {
      console.error('Error creating board:', err);
      setError('Có lỗi xảy ra khi tạo bảng mới');
    }
  };

  const deleteBoard = async (boardId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bảng này? Tất cả danh sách và thẻ trong bảng sẽ bị xóa.')) {
      return;
    }
    
    try {
      await boardsApi.deleteBoard(boardId);
      setBoards(boards.filter(board => board._id !== boardId));
    } catch (err: any) {
      console.error('Error deleting board:', err);
      setError('Có lỗi xảy ra khi xóa bảng');
    }
  };

  const updateBoardTitle = async (boardId: string) => {
    if (!editingTitle.trim()) return;
    
    try {
      const updatedBoard = await boardsApi.updateBoard(boardId, {
        title: editingTitle
      });
      
      setBoards(boards.map(board => 
        board._id === boardId ? updatedBoard : board
      ));
      
      setEditingBoard(null);
      setEditingTitle('');
    } catch (err: any) {
      console.error('Error updating board title:', err);
      setError('Có lỗi xảy ra khi cập nhật tiêu đề bảng');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 flex items-center justify-center">
        <div className="text-white text-xl">Đang tải danh sách bảng...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 flex items-center justify-center">
        <div className="text-white text-xl text-center">
          <div className="mb-4">{error}</div>
          <button 
            onClick={loadBoards}
            className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition-all duration-200 backdrop-blur-sm"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700">
      {/* Header */}
      <div className="bg-blue-800 bg-opacity-10 backdrop-blur-sm border-b border-blue-300 border-opacity-20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Grid className="text-white" size={28} />
              <h1 className="text-2xl font-bold text-white">Bảng của tôi</h1>
            </div>
            <div className="text-white text-sm">
             Đang sử dụng: <span className="font-semibold">{username}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Boards Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Existing Boards */}
          {boards.map(board => (
            <div 
              key={board._id}
              className="bg-white bg-opacity-95 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group"
              onClick={() => onBoardSelect(board._id)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  {editingBoard === board._id ? (
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onBlur={() => updateBoardTitle(board._id)}
                      onKeyPress={(e) => e.key === 'Enter' && updateBoardTitle(board._id)}
                      className="font-semibold text-gray-800 text-lg bg-white border border-blue-500 rounded px-2 py-1 outline-none flex-1"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <h3 
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingBoard(board._id);
                        setEditingTitle(board.title);
                      }}
                      className="font-semibold text-gray-800 text-lg cursor-pointer hover:bg-gray-100 px-2 py-1 rounded flex-1"
                    >
                      {board.title}
                    </h3>
                  )}
                  
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingBoard(board._id);
                        setEditingTitle(board.title);
                      }}
                      className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteBoard(board._id);
                      }}
                      className="text-gray-400 hover:text-red-600 transition-colors p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Bảng hoạt động</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Add New Board */}
          {showNewBoard ? (
            <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-xl shadow-lg">
              <div className="p-6">
                <input
                  type="text"
                  value={newBoardTitle}
                  onChange={(e) => setNewBoardTitle(e.target.value)}
                  placeholder="Nhập tên bảng..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 mb-4"
                  autoFocus
                />
                <div className="flex items-center space-x-2">
                  <button
                    onClick={createBoard}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                  >
                    Tạo bảng
                  </button>
                  <button
                    onClick={() => {
                      setShowNewBoard(false);
                      setNewBoardTitle('');
                    }}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm rounded-lg transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowNewBoard(true)}
              className="bg-blue-500 hover:bg-blue-600 backdrop-blur-sm rounded-xl p-6 flex items-center justify-center space-x-3 text-white transition-all duration-200 hover:shadow-lg"
            >
              <Plus size={24} />
              <span className="font-medium text-white">Tạo bảng mới</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

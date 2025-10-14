import React, { useState, useEffect } from 'react';
import { Plus, X, MoreHorizontal, Clock, Trash2, Check, ArrowLeft, Palette } from 'lucide-react';
import { boardsApi, type Board } from '../api/boards';
import { listsApi, type List } from '../api/lists';
import { cardsApi, type Card } from '../api/cards';

interface BoardDetailProps {
  boardId: string;
  onBack: () => void;
}

export default function BoardDetail({ boardId, onBack }: BoardDetailProps) {
  const [board, setBoard] = useState<Board | null>(null);
  const [lists, setLists] = useState<List[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newCardTitle, setNewCardTitle] = useState('');
  const [showNewCard, setShowNewCard] = useState<string | null>(null);
  const [newListTitle, setNewListTitle] = useState('');
  const [showNewList, setShowNewList] = useState(false);
  const [draggedCard, setDraggedCard] = useState<Card | null>(null);
  const [draggedFromList, setDraggedFromList] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingList, setEditingList] = useState<string | null>(null);
  const [editingListTitle, setEditingListTitle] = useState('');
  const [editingDates, setEditingDates] = useState<string | null>(null);
  const [editingDueDate, setEditingDueDate] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [isInviting, setIsInviting] = useState(false);
  const [boardMembers, setBoardMembers] = useState<any[]>([]);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const [colorPickerType, setColorPickerType] = useState<'list' | 'card' | null>(null);

  // Load data từ backend
  useEffect(() => {
    loadData();
  }, [boardId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load board details
      const boardData = await boardsApi.getBoard(boardId);
      setBoard(boardData);
      
      // Load board members
      if (boardData.members && boardData.members.length > 0) {
        setBoardMembers(boardData.members);
      }
      
      // Load lists cho board này
      const listsData = await listsApi.getListsByBoard(boardId);
      setLists(listsData);
      
      // Load cards cho tất cả lists
      const allCards: Card[] = [];
      for (const list of listsData) {
        const cardsData = await cardsApi.getCardsByList(list._id);
        allCards.push(...cardsData);
      }
      setCards(allCards);
    } catch (err: any) {
      console.error('Error loading data:', err);
      console.error('Error details:', err.response?.data || err.message);
      setError(`Có lỗi xảy ra khi tải dữ liệu: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const addCard = async (listId: string) => {
    if (!newCardTitle.trim()) return;
    
    try {
      const newCard = await cardsApi.createCard(boardId, listId, {
        title: newCardTitle,
        description: ''
      });
      
      setCards([...cards, newCard]);
      setNewCardTitle('');
      setShowNewCard(null);
    } catch (err: any) {
      console.error('Error creating card:', err);
      setError('Có lỗi xảy ra khi tạo thẻ');
    }
  };

  const addList = async () => {
    if (!newListTitle.trim()) return;
    
    try {
      const newList = await listsApi.createList(boardId, {
        title: newListTitle
      });
      
      setLists([...lists, newList]);
      setNewListTitle('');
      setShowNewList(false);
    } catch (err: any) {
      console.error('Error creating list:', err);
      setError('Có lỗi xảy ra khi tạo danh sách');
    }
  };

  const deleteCard = async (cardId: string) => {
    try {
      await cardsApi.deleteCard(cardId);
      setCards(cards.filter(card => card._id !== cardId));
    } catch (err: any) {
      console.error('Error deleting card:', err);
      setError('Có lỗi xảy ra khi xóa thẻ');
    }
  };

  const deleteList = async (listId: string) => {
    try {
      await listsApi.deleteList(boardId, listId);
      setLists(lists.filter(list => list._id !== listId));
      // Cũng xóa tất cả cards của list này
      setCards(cards.filter(card => card.listId !== listId));
    } catch (err: any) {
      console.error('Error deleting list:', err);
      setError('Có lỗi xảy ra khi xóa danh sách');
    }
  };

  const handleDragStart = (e: React.DragEvent, card: Card, listId: string) => {
    setDraggedCard(card);
    setDraggedFromList(listId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetListId: string) => {
    e.preventDefault();
    
    if (!draggedCard || draggedFromList === targetListId) return;

    try {
      // Tìm vị trí cuối cùng trong list đích
      const targetListCards = cards.filter(card => card.listId === targetListId);
      const targetPosition = targetListCards.length;

      await cardsApi.moveCard(draggedCard._id, {
        targetListId,
        targetPosition
      });

      // Cập nhật state local
      const updatedCard = { ...draggedCard, listId: targetListId, position: targetPosition };
      setCards(cards.map(card => 
        card._id === draggedCard._id ? updatedCard : card
      ));
    } catch (err: any) {
      console.error('Error moving card:', err);
      setError('Có lỗi xảy ra khi di chuyển thẻ');
    }

    setDraggedCard(null);
    setDraggedFromList(null);
  };

  const getLabelColor = (label: string) => {
    const colors: Record<string, string> = {
      'Design': 'bg-purple-500',
      'Backend': 'bg-blue-500',
      'Research': 'bg-green-500',
      'Testing': 'bg-yellow-500',
      'Setup': 'bg-gray-500'
    };
    return colors[label] || 'bg-gray-400';
  };

  const toggleComplete = async (cardId: string) => {
    try {
      setCards(cards.map(card => 
        card._id === cardId 
          ? { ...card, labels: card.labels.includes('completed') 
              ? card.labels.filter(l => l !== 'completed')
              : [...card.labels, 'completed']
            }
          : card
      ));
    } catch (err: any) {
      console.error('Error toggling complete:', err);
      setError('Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  const getAvatarColor = (name: string) => {
    const colors: Record<string, string> = {
      'A': 'from-pink-400 to-purple-600',
      'B': 'from-green-400 to-blue-600',
      'C': 'from-yellow-400 to-orange-600'
    };
    return colors[name] || 'from-gray-400 to-gray-600';
  };

  const getMemberInitials = (member: any) => {
    if (member.username) {
      return member.username.charAt(0).toUpperCase();
    }
    if (member.email) {
      return member.email.charAt(0).toUpperCase();
    }
    return '?';
  };

  const getMemberColor = (member: any) => {
    const name = member.username || member.email || 'Unknown';
    const colors = [
      'from-pink-400 to-purple-600',
      'from-green-400 to-blue-600',
      'from-yellow-400 to-orange-600',
      'from-blue-400 to-indigo-600',
      'from-red-400 to-pink-600',
      'from-teal-400 to-cyan-600',
      'from-purple-400 to-pink-600',
      'from-indigo-400 to-purple-600'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const updateCardTitle = async (cardId: string) => {
    if (!editingTitle.trim()) return;
    
    try {
      const updatedCard = await cardsApi.updateCard(cardId, {
        title: editingTitle
      });
      
      setCards(cards.map(card => 
        card._id === cardId ? updatedCard : card
      ));
      
      setEditingCard(null);
      setEditingTitle('');
    } catch (err: any) {
      console.error('Error updating card title:', err);
      setError('Có lỗi xảy ra khi cập nhật tiêu đề');
    }
  };

  const updateListTitle = async (listId: string) => {
    if (!editingListTitle.trim()) return;
    
    try {
      const updatedList = await listsApi.updateList(boardId, listId, {
        title: editingListTitle
      });
      
      setLists(lists.map(list => 
        list._id === listId ? updatedList : list
      ));
      
      setEditingList(null);
      setEditingListTitle('');
    } catch (err: any) {
      console.error('Error updating list title:', err);
      setError('Có lỗi xảy ra khi cập nhật tiêu đề danh sách');
    }
  };

  const updateCardDates = async (cardId: string) => {
    try {
      const dueDate = editingDueDate ? new Date(editingDueDate).toISOString() : undefined;
      
      const updatedCard = await cardsApi.updateCard(cardId, {
        dueDate
      });
      
      setCards(cards.map(card => 
        card._id === cardId ? updatedCard : card
      ));
      
      setEditingDates(null);
      setEditingDueDate('');
    } catch (err: any) {
      console.error('Error updating card dates:', err);
      setError('Có lỗi xảy ra khi cập nhật ngày tháng');
    }
  };

  const isOverdue = (dueDate: string, completed: boolean) => {
    if (completed || !dueDate) return false;
    
    const today = new Date();
    const due = new Date(dueDate);
    
    return today > due;
  };

  const formatDateForInput = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  };

  const formatDateForDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const removeMember = async (memberId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa thành viên này khỏi board?')) {
      return;
    }
    
    try {
      await boardsApi.removeMember(boardId, memberId);
      
      // Cập nhật danh sách thành viên
      const updatedMembers = boardMembers.filter(member => member._id !== memberId);
      setBoardMembers(updatedMembers);
      
      alert('Đã xóa thành viên khỏi board thành công');
    } catch (err: any) {
      console.error('Error removing member:', err);
      alert('Có lỗi xảy ra khi xóa thành viên');
    }
  };

  const updateListColor = async (listId: string, color: string) => {
    try {
      const updatedList = await listsApi.updateListColor(boardId, listId, color);
      setLists(lists.map(list => 
        list._id === listId ? updatedList : list
      ));
      setShowColorPicker(null);
      setColorPickerType(null);
    } catch (err: any) {
      console.error('Error updating list color:', err);
      alert('Có lỗi xảy ra khi cập nhật màu sắc');
    }
  };

  const updateCardColor = async (cardId: string, color: string) => {
    try {
      const updatedCard = await cardsApi.updateCardColor(cardId, color);
      setCards(cards.map(card => 
        card._id === cardId ? updatedCard : card
      ));
      setShowColorPicker(null);
      setColorPickerType(null);
    } catch (err: any) {
      console.error('Error updating card color:', err);
      alert('Có lỗi xảy ra khi cập nhật màu sắc');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 flex items-center justify-center">
        <div className="text-white text-xl">Đang tải bảng...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 flex items-center justify-center">
        <div className="text-white text-xl text-center">
          <div className="mb-4">{error}</div>
          <button 
            onClick={loadData}
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
      <div className="bg-gray-700 bg-opacity-10 backdrop-blur-sm border-b border-white border-opacity-20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-white hover:text-blue-200 transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Quay lại</span>
              </button>
              <div className="h-6 w-px bg-white bg-opacity-30"></div>
              <h1 className="text-2xl font-bold text-white">{board?.title}</h1>
            </div>
            <div className="flex items-center space-x-3">
              {/* Board Members */}
              <div 
                className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setShowMembersModal(true)}
                title="Xem và quản lý thành viên"
              >
                {boardMembers.slice(0, 5).map((member, index) => (
                  <div
                    key={member._id || index}
                    className={`w-8 h-8 rounded-full bg-gradient-to-br ${getMemberColor(member)} flex items-center justify-center text-white text-sm font-semibold shadow-sm border-2 border-white`}
                    title={member.username || member.email || 'Unknown'}
                  >
                    {getMemberInitials(member)}
                  </div>
                ))}
                {boardMembers.length > 5 && (
                  <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-sm font-semibold shadow-sm border-2 border-white">
                    +{boardMembers.length - 5}
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setShowInviteModal(true)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200"
              >
                Mời người khác
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Mời người khác vào bảng</h2>
            {inviteError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {inviteError}
              </div>
            )}
            <div className="mb-4">
              <label htmlFor="inviteEmail" className="block mb-2 font-medium text-gray-700">
                Email người được mời
              </label>
              <input
                type="email"
                id="inviteEmail"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="bg-gray-50 border border-gray-300 rounded-lg block w-full p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition duration-200"
                placeholder="Nhập email"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteEmail('');
                  setInviteError(null);
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={async () => {
                  if (!inviteEmail.trim()) {
                    setInviteError('Vui lòng nhập email');
                    return;
                  }
                  setIsInviting(true);
                  setInviteError(null);
                try {
                  const response = await boardsApi.inviteMemberByEmail(boardId, inviteEmail);
                  alert(response.message || `Đã gửi lời mời đến ${inviteEmail}. Họ cần chấp nhận để tham gia board.`);
                  
                  setShowInviteModal(false);
                  setInviteEmail('');
                } catch (err: any) {
                  const errorMessage = err.response?.data?.message || 'Có lỗi xảy ra khi gửi lời mời. Vui lòng thử lại.';
                  setInviteError(errorMessage);
                } finally {
                  setIsInviting(false);
                }
                }}
                disabled={isInviting}
                className={`px-4 py-2 text-white rounded-lg transition duration-200 ${
                  isInviting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {isInviting ? 'Đang gửi...' : 'Gửi lời mời'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Members Management Modal */}
      {showMembersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Quản lý thành viên</h2>
            
            <div className="space-y-3 mb-4">
              {boardMembers.map((member) => (
                <div key={member._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getMemberColor(member)} flex items-center justify-center text-white text-sm font-semibold shadow-sm`}>
                      {getMemberInitials(member)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">
                        {member.username || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {member.email}
                      </div>
                    </div>
                  </div>
                  
                  {member._id !== board?.owner && (
                    <button
                      onClick={() => removeMember(member._id)}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition-colors"
                    >
                      Xóa
                    </button>
                  )}
                  
                  {member._id === board?.owner && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                      Owner
                    </span>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setShowMembersModal(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Color Picker Modal */}
      {showColorPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Chọn màu sắc cho {colorPickerType === 'list' ? 'danh sách' : 'thẻ'}
            </h2>
            
            <div className="grid grid-cols-6 gap-3 mb-4">
              {[
                '#f3f4f6', '#e5e7eb', '#d1d5db', '#9ca3af', '#6b7280', '#374151',
                '#fef3c7', '#fde68a', '#f59e0b', '#d97706', '#92400e', '#78350f',
                '#dbeafe', '#93c5fd', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af',
                '#d1fae5', '#6ee7b7', '#10b981', '#059669', '#047857', '#065f46',
                '#fce7f3', '#f9a8d4', '#ec4899', '#db2777', '#be185d', '#9d174d',
                '#e0e7ff', '#a5b4fc', '#6366f1', '#4f46e5', '#4338ca', '#3730a3'
              ].map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    if (colorPickerType === 'list') {
                      updateListColor(showColorPicker, color);
                    } else {
                      updateCardColor(showColorPicker, color);
                    }
                  }}
                  className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-gray-500 transition-colors"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowColorPicker(null);
                  setColorPickerType(null);
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Board Container */}
      <div className="p-6 overflow-x-auto">
        <div className="flex space-x-4 min-w-max">
          {/* Lists */}
          {lists.map(list => (
            <div 
              key={list._id} 
              className="w-80 flex-shrink-0"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, list._id)}
            >
              <div 
                className="bg-opacity-95 backdrop-blur-sm rounded-xl shadow-lg"
                style={{ backgroundColor: list.color || '#f3f4f6' }}
              >
                {/* List Header */}
                <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between" style={{ backgroundColor: list.color || '#f3f4f6' }}>
                  {editingList === list._id ? (
                    <input
                      type="text"
                      value={editingListTitle}
                      onChange={(e) => setEditingListTitle(e.target.value)}
                      onBlur={() => updateListTitle(list._id)}
                      onKeyPress={(e) => e.key === 'Enter' && updateListTitle(list._id)}
                      className="font-semibold text-gray-800 text-sm bg-white border border-blue-500 rounded px-2 py-1 outline-none flex-1"
                      autoFocus
                    />
                  ) : (
                    <h3 
                      onClick={() => {
                        setEditingList(list._id);
                        setEditingListTitle(list.title);
                      }}
                      className="font-semibold text-gray-800 text-sm cursor-pointer hover:bg-gray-200 px-2 py-1 rounded"
                    >
                      {list.title}
                    </h3>
                  )}
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                      {cards.filter(card => card.listId === list._id).length}
                    </span>
                    <button 
                      onClick={() => {
                        setShowColorPicker(list._id);
                        setColorPickerType('list');
                      }}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                      title="Thay đổi màu sắc"
                    >
                      <Palette size={16} />
                    </button>
                    <button 
                      onClick={() => deleteList(list._id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button className="text-gray-400 hover:text-gray-600 transition-colors">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                </div>

                {/* Cards */}
                <div className="p-3 space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto" style={{ backgroundColor: list.color || '#f3f4f6' }}>
                  {cards.filter(card => card.listId === list._id).map(card => (
                    <div
                      key={card._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, card, list._id)}
                      className={`rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-move group ${card.labels.includes('completed') ? 'border-2 border-green-400' : ''}`}
                      style={{ backgroundColor: card.color || '#ffffff' }}
                    >
                      <div className="p-3">
                        {/* Completion Status */}
                        {card.labels.includes('completed') && (
                          <div className="flex items-center justify-between mb-2 bg-green-50 rounded-lg px-2 py-1.5">
                            <div className="flex items-center space-x-1.5">
                              <div className="bg-green-500 rounded-full p-0.5">
                                <Check size={12} className="text-white" />
                              </div>
                              <span className="text-xs text-green-700 font-medium">Hoàn thành</span>
                            </div>
                            {card.createdBy && (
                              <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${getAvatarColor(card.createdBy)} flex items-center justify-center text-white text-xs font-semibold shadow-sm`}>
                                {card.createdBy}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Labels */}
                        {card.labels.filter(label => label !== 'completed').length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {card.labels.filter(label => label !== 'completed').map((label, idx) => (
                              <span 
                                key={idx}
                                className={`${getLabelColor(label)} text-white text-xs px-2 py-1 rounded-full font-medium`}
                              >
                                {label}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {/* Card Title */}
                        {editingCard === card._id ? (
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onBlur={() => updateCardTitle(card._id)}
                            onKeyPress={(e) => e.key === 'Enter' && updateCardTitle(card._id)}
                            className="text-sm font-medium text-gray-800 mb-2 w-full border border-blue-500 rounded px-2 py-1 outline-none"
                            autoFocus
                          />
                        ) : (
                          <h4 
                            onClick={() => {
                              setEditingCard(card._id);
                              setEditingTitle(card.title);
                            }}
                            className={`text-sm font-medium text-gray-800 mb-2 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded ${card.labels.includes('completed') ? 'line-through opacity-60' : ''}`}
                          >
                            {card.title}
                          </h4>
                        )}
                        
                        {/* Card Description */}
                        {card.description && (
                          <p className={`text-xs text-gray-600 mb-3 ${card.labels.includes('completed') ? 'opacity-60' : ''}`}>
                            {card.description}
                          </p>
                        )}

                        {/* Card Footer */}
                        <div className="flex flex-col space-y-2 text-xs">
                          {/* Dates */}
                          {editingDates === card._id ? (
                            <div className="bg-gray-50 rounded-lg p-2 space-y-2">
                              <div>
                                <label className="text-xs text-gray-600 block mb-1">Ngày kết thúc</label>
                                <input
                                  type="date"
                                  value={editingDueDate}
                                  onChange={(e) => setEditingDueDate(e.target.value)}
                                  className="w-full text-xs border border-gray-300 rounded px-2 py-1 outline-none focus:border-blue-500"
                                />
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => updateCardDates(card._id)}
                                  className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                                >
                                  Lưu
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingDates(null);
                                    setEditingDueDate('');
                                  }}
                                  className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
                                >
                                  Hủy
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div 
                              onClick={() => {
                                setEditingDates(card._id);
                                setEditingDueDate(card.dueDate ? formatDateForInput(card.dueDate) : '');
                              }}
                              className="cursor-pointer hover:bg-gray-50 rounded p-1.5 space-y-1"
                            >
                              {card.dueDate && (
                                <div className={`flex items-center space-x-1 ${
                                  isOverdue(card.dueDate, card.labels.includes('completed')) 
                                    ? 'text-red-600 font-semibold' 
                                    : 'text-gray-600'
                                }`}>
                                  <Clock size={12} />
                                  <span>
                                    {isOverdue(card.dueDate, card.labels.includes('completed')) && 'QUÁ HẠN - '}
                                    Hết hạn: {formatDateForDisplay(card.dueDate)}
                                  </span>
                                </div>
                              )}
                              {!card.dueDate && (
                                <div className="flex items-center space-x-1 text-gray-400">
                                  <Clock size={12} />
                                  <span>Thêm thời gian</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => toggleComplete(card._id)}
                                className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${
                                  card.labels.includes('completed') 
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                <Check size={12} />
                                <span className="text-xs">{card.labels.includes('completed') ? 'Hoàn thành' : 'Đánh dấu'}</span>
                              </button>
                              <button 
                                onClick={() => {
                                  setShowColorPicker(card._id);
                                  setColorPickerType('card');
                                }}
                                className="opacity-0 group-hover:opacity-100 text-blue-500 hover:text-blue-700 transition-all"
                                title="Thay đổi màu sắc"
                              >
                                <Palette size={14} />
                              </button>
                            </div>
                            <button 
                              onClick={() => deleteCard(card._id)}
                              className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-all"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Add New Card */}
                  {showNewCard === list._id ? (
                    <div className="bg-white rounded-lg shadow-sm p-3">
                      <textarea
                        value={newCardTitle}
                        onChange={(e) => setNewCardTitle(e.target.value)}
                        placeholder="Nhập tiêu đề thẻ..."
                        className="w-full text-sm border-none outline-none resize-none"
                        rows={3}
                        autoFocus
                      />
                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          onClick={() => addCard(list._id)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                        >
                          Thêm thẻ
                        </button>
                        <button
                          onClick={() => {
                            setShowNewCard(null);
                            setNewCardTitle('');
                          }}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowNewCard(list._id)}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors text-sm"
                    >
                      <Plus size={16} />
                      <span>Thêm thẻ</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Add New List */}
          {showNewList ? (
            <div className="w-80 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-lg p-4">
                <input
                  type="text"
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  placeholder="Nhập tiêu đề danh sách..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500"
                  autoFocus
                />
                <div className="flex items-center space-x-2 mt-3">
                  <button
                    onClick={addList}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                  >
                    Thêm danh sách
                  </button>
                  <button
                    onClick={() => {
                      setShowNewList(false);
                      setNewListTitle('');
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowNewList(true)}
              className="w-80 flex-shrink-0 bg-blue-500 hover:bg-blue-600 backdrop-blur-sm rounded-xl p-4 flex items-center justify-center space-x-2 text-white transition-all duration-200"
            >
              <Plus size={20} />
              <span className="font-medium text-white">Thêm danh sách khác</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}



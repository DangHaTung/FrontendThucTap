import React, { useState, useEffect } from 'react';
import { Plus, X, MoreHorizontal, Clock, Trash2, Check } from 'lucide-react';
import { boardsApi, type Board } from '../api/boards';
import { listsApi, type List } from '../api/lists';
import { cardsApi, type Card } from '../api/cards';
import { debugApi } from '../utils/debugApi';
import { useAuth } from '../contexts/AuthContext';


export default function TrelloClone() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [lists, setLists] = useState<List[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const [newCardTitle, setNewCardTitle] = useState('');
  const [showNewCard, setShowNewCard] = useState<string | null>(null);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [showNewBoard, setShowNewBoard] = useState(false);
  const [draggedCard, setDraggedCard] = useState<Card | null>(null);
  const [draggedFromBoard, setDraggedFromBoard] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingBoard, setEditingBoard] = useState<string | null>(null);
  const [editingBoardTitle, setEditingBoardTitle] = useState('');
  const [editingDates, setEditingDates] = useState<string | null>(null);
  const [editingDueDate, setEditingDueDate] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteStatus, setInviteStatus] = useState<'idle'|'loading'|'success'|'error'>( 'idle');
  const [inviteMessage, setInviteMessage] = useState('');



  const {username} = useAuth();
  // Load data từ backend
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Debug API first
      console.log('Testing API connection...');
      const authTest = await debugApi.testAuth();
      if (!authTest) {
        setError('Không thể kết nối với API. Vui lòng kiểm tra token và kết nối mạng.');
        return;
      }
      
      // Load boards
      const boardsData = await boardsApi.getMyBoards();
      setBoards(boardsData);
      
      if (boardsData.length > 0) {
        // Load lists cho board đầu tiên (hoặc có thể chọn board hiện tại)
        const firstBoard = boardsData[0];
        const listsData = await listsApi.getListsByBoard(firstBoard._id);
        setLists(listsData);
        
        // Load cards cho tất cả lists
        const allCards: Card[] = [];
        for (const list of listsData) {
          const cardsData = await cardsApi.getCardsByList(list._id);
          allCards.push(...cardsData);
        }
        setCards(allCards);
      } else {
        // Nếu không có boards, tạo một board mặc định
        const defaultBoard = await boardsApi.createBoard({
          title: 'Bảng Mặc Định'
        });
        setBoards([defaultBoard]);
        setLists([]);
        setCards([]);
      }
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
      // Tìm boardId từ listId
      const list = lists.find(l => l._id === listId);
      if (!list) return;
      
      const newCard = await cardsApi.createCard(list.boardId, listId, {
        title: newCardTitle,
        description: '',
        labels: []
      });
      
      setCards([...cards, newCard]);
      setNewCardTitle('');
      setShowNewCard(null);
    } catch (err: any) {
      console.error('Error creating card:', err);
      setError('Có lỗi xảy ra khi tạo thẻ');
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


  const addBoard = async () => {
    if (!newBoardTitle.trim()) return;
    
    try {
      // Tạo list cho board đầu tiên
      if (boards.length === 0) return;
      
      const firstBoard = boards[0];
      const newList = await listsApi.createList(firstBoard._id, {
        title: newBoardTitle
      });
      
      setLists([...lists, newList]);
      setNewBoardTitle('');
      setShowNewBoard(false);
    } catch (err: any) {
      console.error('Error creating list:', err);
      setError('Có lỗi xảy ra khi tạo danh sách');
    }
  };


  const deleteBoard = async (listId: string) => {
    try {
      // Tìm boardId từ listId
      const list = lists.find(l => l._id === listId);
      if (!list) return;
      
      await listsApi.deleteList(list.boardId, listId);
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
    setDraggedFromBoard(listId);
    e.dataTransfer.effectAllowed = 'move';
  };


  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };


  const handleDrop = async (e: React.DragEvent, targetListId: string) => {
    e.preventDefault();
    
    if (!draggedCard || draggedFromBoard === targetListId) return;

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
    setDraggedFromBoard(null);
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
      // Note: Backend không có field completed/completedBy, 
      // có thể cần thêm vào model hoặc sử dụng labels
      // Tạm thời chỉ update local state
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


  const updateBoardTitle = async (listId: string) => {
    if (!editingBoardTitle.trim()) return;
    
    try {
      // Tìm boardId từ listId
      const list = lists.find(l => l._id === listId);
      if (!list) return;
      
      const updatedList = await listsApi.updateList(list.boardId, listId, {
        title: editingBoardTitle
      });
      
      setLists(lists.map(list => 
        list._id === listId ? updatedList : list
      ));
      
      setEditingBoard(null);
      setEditingBoardTitle('');
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


  // Hàm mời thành viên
  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    if (boards.length === 0) return;
    setInviteStatus('loading');
    setInviteMessage('');
    try {
      // Ưu tiên dùng inviteMemberByEmail nếu backend hỗ trợ
      await boardsApi.inviteMemberByEmail(boards[0]._id, inviteEmail.trim());
      setInviteStatus('success');
      setInviteMessage('Đã gửi lời mời!');
      setInviteEmail('');
    } catch (err: any) {
      // Nếu lỗi 404 hoặc không có endpoint, fallback sang inviteMember
      try {
        await boardsApi.inviteMember(boards[0]._id, inviteEmail.trim());
        setInviteStatus('success');
        setInviteMessage('Đã gửi lời mời!');
        setInviteEmail('');
      } catch (err2: any) {
        setInviteStatus('error');
        setInviteMessage(
          err2?.response?.data?.message ||
          err?.response?.data?.message ||
          'Có lỗi xảy ra khi gửi lời mời'
        );
      }
    } finally {
      setTimeout(() => setInviteStatus('idle'), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 flex items-center justify-center">
        <div className="text-white text-xl">Đang tải...</div>
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
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <span className="text-white text-xl font-bold">Trello Clone</span>
        </div>
        {/* Mời người khác bằng email */}
        <div className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-lg px-3 py-2 backdrop-blur-sm">
          <input
            type="email"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            placeholder="Nhập email để mời"
            className="px-2 py-1 rounded border-none outline-none text-sm bg-white bg-opacity-80"
            disabled={inviteStatus === 'loading'}
          />
          <button
            onClick={handleInvite}
            disabled={inviteStatus === 'loading' || !inviteEmail.trim()}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm disabled:opacity-60"
          >
            Mời
          </button>
          {inviteStatus === 'loading' && (
            <span className="text-xs text-blue-100 ml-2">Đang gửi...</span>
          )}
          {inviteStatus === 'success' && (
            <span className="text-xs text-green-200 ml-2">{inviteMessage}</span>
          )}
          {inviteStatus === 'error' && (
            <span className="text-xs text-red-200 ml-2">{inviteMessage}</span>
          )}
        </div>
        <div>
          <span className="text-white text-sm">Xin chào, {username}</span>
        </div>
      </div>
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
              <div className="bg-gray-100 bg-opacity-95 backdrop-blur-sm rounded-xl shadow-lg">
                {/* List Header */}
                <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                  {editingBoard === list._id ? (
                    <input
                      type="text"
                      value={editingBoardTitle}
                      onChange={(e) => setEditingBoardTitle(e.target.value)}
                      onBlur={() => updateBoardTitle(list._id)}
                      onKeyPress={(e) => e.key === 'Enter' && updateBoardTitle(list._id)}
                      className="font-semibold text-gray-800 text-sm bg-white border border-blue-500 rounded px-2 py-1 outline-none flex-1"
                      autoFocus
                    />
                  ) : (
                    <h3 
                      onClick={() => {
                        setEditingBoard(list._id);
                        setEditingBoardTitle(list.title);
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
                      onClick={() => deleteBoard(list._id)}
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
                <div className="p-3 space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto">
                  {cards.filter(card => card.listId === list._id).map(card => (
                    <div
                      key={card._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, card, list._id)}
                      className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-move group ${card.labels.includes('completed') ? 'border-2 border-green-400' : ''}`}
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

          {/* Add New List - chỉ hiển thị khi có lists */}
          {boards.length > 0 && (
            <>
              {showNewBoard ? (
                <div className="w-80 flex-shrink-0">
                  <div className="bg-white rounded-xl shadow-lg p-4">
                    <input
                      type="text"
                      value={newBoardTitle}
                      onChange={(e) => setNewBoardTitle(e.target.value)}
                      placeholder="Nhập tiêu đề danh sách..."
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500"
                      autoFocus
                    />
                    <div className="flex items-center space-x-2 mt-3">
                      <button
                        onClick={addBoard}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                      >
                        Thêm danh sách
                      </button>
                      <button
                        onClick={() => {
                          setShowNewBoard(false);
                          setNewBoardTitle('');
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
                  onClick={() => setShowNewBoard(true)}
                  className="w-80 flex-shrink-0 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-xl p-4 flex items-center justify-center space-x-2 text-white transition-all duration-200"
                >
                  <Plus size={20} />
                  <span className="font-medium">Thêm danh sách khác</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}




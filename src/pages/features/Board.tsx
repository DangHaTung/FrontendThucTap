import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, X, Clock, Trash2, Check, Calendar, Tag, AlertCircle, ArrowLeft, CheckCircle2, Image, UserPlus, Mail, Send, Users } from "lucide-react";
import { boardsApi, type Board } from "../../api/boards";
import { listsApi, type List } from "../../api/lists";
import { cardsApi, type Card } from "../../api/cards";
import { useAuth } from "../../contexts/AuthContext";

// Constants
const LABEL_COLORS = [
  { name: "Đỏ", value: "#ef4444", bg: "bg-red-500" },
  { name: "Cam", value: "#f97316", bg: "bg-orange-500" },
  { name: "Vàng", value: "#eab308", bg: "bg-yellow-500" },
  { name: "Xanh lá", value: "#22c55e", bg: "bg-green-500" },
  { name: "Xanh dương", value: "#3b82f6", bg: "bg-blue-500" },
  { name: "Tím", value: "#a855f7", bg: "bg-purple-500" },
  { name: "Hồng", value: "#ec4899", bg: "bg-pink-500" },
  { name: "Xám", value: "#6b7280", bg: "bg-gray-500" },
];

const BACKGROUND_IMAGES = [
  "https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&q=80",
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920&q=80",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&q=80",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&q=80",
  "https://images.unsplash.com/photo-1557683311-eac922347aa1?w=1920&q=80",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1920&q=80",
];

// Types
interface ExtendedCard extends Card {
  isCompleted?: boolean;
  createdBy: string;
}

interface BoardMember {
  _id: string;
  username: string;
  email: string;
  avatar?: string | null;
}

interface BoardDetailProps {
  boardId: string;
  onBack: () => void;
}

// Utility Functions
const getCardStatus = (cardId: string): boolean => {
  return localStorage.getItem(`card-status-${cardId}`) === "completed";
};

const setCardStatus = (cardId: string, completed: boolean): void => {
  if (completed) {
    localStorage.setItem(`card-status-${cardId}`, "completed");
  } else {
    localStorage.removeItem(`card-status-${cardId}`);
  }
};

const getBoardBackground = (boardId: string): string => {
  return localStorage.getItem(`board-bg-${boardId}`) || BACKGROUND_IMAGES[0];
};

const setBoardBackground = (boardId: string, imageUrl: string): void => {
  localStorage.setItem(`board-bg-${boardId}`, imageUrl);
};

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

const getDeadlineStatus = (deadline?: string, isCompleted?: boolean) => {
  if (isCompleted) {
    return { 
      status: "completed", 
      text: "Đã hoàn thành",
      color: "text-green-700", 
      bgColor: "bg-green-100", 
      icon: <CheckCircle2 size={12} /> 
    };
  }
  
  if (!deadline) return null;
  
  const deadlineDate = new Date(deadline);
  const diffHours = (deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60);
  
  if (diffHours < 0) {
    return { 
      status: "overdue", 
      text: "Quá hạn",
      color: "text-red-700", 
      bgColor: "bg-red-100", 
      icon: <AlertCircle size={12} /> 
    };
  }
  if (diffHours < 24) {
    return { 
      status: "urgent", 
      text: "Gấp",
      color: "text-orange-700", 
      bgColor: "bg-orange-100", 
      icon: <Clock size={12} /> 
    };
  }
  if (diffHours < 72) {
    return { 
      status: "soon", 
      text: "Sắp đến hạn",
      color: "text-yellow-700", 
      bgColor: "bg-yellow-100", 
      icon: <Clock size={12} /> 
    };
  }
  return { 
    status: "normal", 
    text: "Bình thường",
    color: "text-blue-700", 
    bgColor: "bg-blue-100", 
    icon: <Clock size={12} /> 
  };
};

export default function Board({ }: BoardDetailProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { username, userId, user } = useAuth();

  // Board State
  const [board, setBoard] = useState<Board | null>(null);
  const [lists, setLists] = useState<List[]>([]);
  const [cards, setCards] = useState<ExtendedCard[]>([]);
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI State
  const [boardBackground, setBoardBackgroundState] = useState("");
  const [boardTitle, setBoardTitle] = useState("");
  const [editingBoardTitle, setEditingBoardTitle] = useState(false);
  
  // List State
  const [newListTitle, setNewListTitle] = useState("");
  const [showNewList, setShowNewList] = useState(false);
  const [editingList, setEditingList] = useState<string | null>(null);
  const [editingListTitle, setEditingListTitle] = useState("");
  
  // Card State
  const [newCardTitle, setNewCardTitle] = useState("");
  const [showNewCard, setShowNewCard] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<ExtendedCard | null>(null);
  const [cardDescription, setCardDescription] = useState("");
  const [cardDeadline, setCardDeadline] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [cardCompleted, setCardCompleted] = useState(false);
  
  // Drag & Drop State
  const [draggedCard, setDraggedCard] = useState<ExtendedCard | null>(null);
  const [draggedFromList, setDraggedFromList] = useState<string | null>(null);
  
  // Modal State
  const [showBackgroundModal, setShowBackgroundModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [removingMember, setRemovingMember] = useState<string | null>(null);

  // Load Board Data
  useEffect(() => {
    if (!id) return;
    loadBoardData(id);
    setBoardBackgroundState(getBoardBackground(id));
  }, [id]);

  // Load current user data if userId is empty
  useEffect(() => {
    if (!userId && user) {
      console.log('User object:', user);
    }
  }, [userId, user]);

  const loadBoardData = async (boardId: string) => {
    try {
      setLoading(true);
      setError(null);

      const boardData = await boardsApi.getBoardById(boardId);
      console.log('Board data:', boardData);
      console.log('Current user:', user);
      console.log('Current userId:', userId);
      console.log('Board owner:', boardData.owner);
      
      // Xử lý board.owner - có thể là object hoặc string
      const processedBoardData = {
        ...boardData,
        owner: typeof boardData.owner === 'object' && boardData.owner 
          ? (boardData.owner as any)._id || (boardData.owner as any).id 
          : boardData.owner
      };
      
      setBoard(processedBoardData);
      setBoardTitle(boardData.title);
      // Đảm bảo boardMembers luôn là array và có cấu trúc đúng
      const members = Array.isArray(boardData.members) ? boardData.members : [];
      setBoardMembers(
        members.map((m: any) => {
          if (typeof m === "string") {
            return { _id: m, username: "Không rõ", email: "Không rõ" };
          }
          // Đảm bảo object có đủ các trường cần thiết
          return {
            _id: m._id || m.id || "",
            username: m.username || m.name || "Không rõ",
            email: m.email || "Không rõ",
            avatar: m.avatar || null
          };
        })
      );

      const listsData = await listsApi.getListsByBoard(boardId);
      setLists(listsData);

      const allCards: ExtendedCard[] = [];
      for (const list of listsData) {
        const cardsData = await cardsApi.getCardsByList(list._id);
        const cardsWithStatus = cardsData.map(card => ({
          ...card,
          isCompleted: getCardStatus(card._id)
        }));
        allCards.push(...cardsWithStatus);
      }
      setCards(allCards);
    } catch (err: any) {
      console.error("Error loading board:", err);
      
      if (err.response?.status === 401) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        setTimeout(() => {
          localStorage.removeItem('token');
          navigate('/login');
        }, 2000);
      } else {
        setError(`Lỗi tải dữ liệu: ${err.response?.data?.message || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // List Operations
  const handleAddList = async () => {
    if (!board || !newListTitle.trim()) return;
    try {
      const newList = await listsApi.createList(board._id, { title: newListTitle });
      setLists([...lists, newList]);
      setNewListTitle("");
      setShowNewList(false);
    } catch {
      setError("Lỗi khi tạo danh sách mới");
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (!board || !window.confirm("Bạn có chắc muốn xóa danh sách này?")) return;
    try {
      await listsApi.deleteList(board._id, listId);
      setLists(lists.filter((l) => l._id !== listId));
      
      const deletedCards = cards.filter((c) => c.listId === listId);
      deletedCards.forEach(card => setCardStatus(card._id, false));
      setCards(cards.filter((c) => c.listId !== listId));
    } catch {
      setError("Lỗi khi xóa danh sách");
    }
  };

  const handleUpdateListTitle = async (listId: string) => {
    if (!board || !editingListTitle.trim()) {
      setEditingList(null);
      return;
    }
    try {
      const updated = await listsApi.updateList(board._id, listId, {
        title: editingListTitle,
      });
      setLists(lists.map((l) => (l._id === listId ? updated : l)));
      setEditingList(null);
      setEditingListTitle("");
    } catch {
      setError("Lỗi khi cập nhật tên danh sách");
    }
  };

  // Card Operations
  const handleAddCard = async (listId: string) => {
    if (!newCardTitle.trim() || !board) return;
    try {
      const newCard = await cardsApi.createCard(board._id, listId, {
        title: newCardTitle,
        description: "",
        labels: [],
      });
      setCards([...cards, { ...newCard, isCompleted: false, createdBy: username }]);
      setNewCardTitle("");
      setShowNewCard(null);
    } catch {
      setError("Lỗi khi tạo thẻ");
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa thẻ này?")) return;
    try {
      await cardsApi.deleteCard(cardId);
      setCards(cards.filter((c) => c._id !== cardId));
      setCardStatus(cardId, false);
      if (selectedCard?._id === cardId) setSelectedCard(null);
    } catch {
      setError("Lỗi khi xóa thẻ");
    }
  };

  const handleOpenCardDetail = (card: ExtendedCard) => {
    setSelectedCard(card);
    setCardDescription(card.description || "");
    setCardDeadline(card.dueDate || "");
    setSelectedColor((card.labels && card.labels[0]) || "");
    setCardCompleted(card.isCompleted || false);
  };

  const handleSaveCardDetails = async () => {
    if (!selectedCard) return;

    try {
      const updated = await cardsApi.updateCard(selectedCard._id, {
        description: cardDescription,
        dueDate: cardDeadline || undefined,
        labels: selectedColor ? [selectedColor] : [],
      });
      
      setCardStatus(selectedCard._id, cardCompleted);
      
      setCards(cards.map((c) => 
        c._id === selectedCard._id 
          ? { ...updated, isCompleted: cardCompleted, createdBy: c.createdBy } 
          : c
      ));
      
      handleCloseCardModal();
    } catch {
      setError("Lỗi khi cập nhật thẻ");
    }
  };

  const handleCloseCardModal = () => {
    setSelectedCard(null);
    setCardDescription("");
    setCardDeadline("");
    setSelectedColor("");
    setCardCompleted(false);
  };

  // Drag & Drop Operations
  const handleDragStart = (e: React.DragEvent, card: ExtendedCard, listId: string) => {
    setDraggedCard(card);
    setDraggedFromList(listId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDrop = async (e: React.DragEvent, targetListId: string) => {
    e.preventDefault();
    if (!draggedCard || draggedFromList === targetListId) {
      setDraggedCard(null);
      setDraggedFromList(null);
      return;
    }
    
    try {
      const targetListCards = cards.filter((c) => c.listId === targetListId);
      const targetPosition = targetListCards.length;

      await cardsApi.moveCard(draggedCard._id, {
        targetListId,
        targetPosition,
      });

      setCards(
        cards.map((c) =>
          c._id === draggedCard._id
            ? { ...c, listId: targetListId, position: targetPosition }
            : c
        )
      );
    } catch {
      setError("Lỗi khi di chuyển thẻ");
    } finally {
      setDraggedCard(null);
      setDraggedFromList(null);
    }
  };

  // Board Operations
  const handleUpdateBoardTitle = async () => {
    if (!board || !boardTitle.trim()) {
      setEditingBoardTitle(false);
      setBoardTitle(board?.title || "");
      return;
    }
    try {
      const updated = await boardsApi.updateBoard(board._id, {
        title: boardTitle,
      });
      setBoard(updated);
      setEditingBoardTitle(false);
    } catch {
      setError("Lỗi khi cập nhật tên bảng");
      setBoardTitle(board.title);
      setEditingBoardTitle(false);
    }
  };

  const handleChangeBackground = (imageUrl: string) => {
    setBoardBackgroundState(imageUrl);
    if (id) {
      setBoardBackground(id, imageUrl);
    }
    setShowBackgroundModal(false);
  };

  // Member Operations
  const handleSendInvite = async () => {
    if (!inviteEmail.trim() || !board) return;
    
    if (!validateEmail(inviteEmail)) {
      setError("Email không hợp lệ");
      setTimeout(() => setError(null), 3000);
      return;
    }

    // Kiểm tra xem email đã tồn tại trong members chưa
    const emailExists = boardMembers.some(member => member.email === inviteEmail);
    if (emailExists) {
      setError("Người dùng đã có trong nhóm");
      setTimeout(() => setError(null), 3000);
      return;
    }

    
    try {
      await boardsApi.inviteMemberByEmail(board._id, inviteEmail);
      
      setInviteSuccess(true);
      setTimeout(() => {
        setInviteEmail("");
        setShowInviteModal(false);
        setInviteSuccess(false);
      }, 2000);
    } catch (err: any) {
      console.error('Error sending invite:', err);
      
      let errorMessage = "Không thể gửi lời mời. Vui lòng thử lại.";
      
      if (err.response?.status === 404) {
        errorMessage = "Không tìm thấy người dùng với email này.";
      } else if (err.response?.status === 400) {
        errorMessage = err.response?.data?.message || "Người dùng đã có trong nhóm.";
      } else if (err.response?.status === 403) {
        errorMessage = "Bạn không có quyền mời thành viên vào bảng này.";
      }
      
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
    } finally {
      setInviteLoading(false);
    }
  };

  const handleCloseInviteModal = () => {
    setShowInviteModal(false);
    setInviteEmail("");
    setInviteSuccess(false);
    setError(null);
  };

  const removeMember = async (memberId: string) => {
    if (!board) {
      alert('Không tìm thấy thông tin board');
      return;
    }

    // Kiểm tra quyền: chỉ người tạo board mới được xóa thành viên
    // Tạm thời comment để test
    // if (board.owner !== userId) {
    //   alert('Bạn không có quyền xóa thành viên. Chỉ người tạo board mới có quyền này.');
    //   return;
    // }

    // Không cho phép xóa chính mình (người tạo board)
    if (memberId === userId) {
      alert('Bạn không thể xóa chính mình khỏi board');
      return;
    }

    // Tìm tên thành viên để hiển thị trong xác nhận
    const memberToRemove = boardMembers.find(m => m._id === memberId);
    const memberName = memberToRemove?.username || 'thành viên này';

    if (!confirm(`Bạn có chắc chắn muốn xóa ${memberName} khỏi board?`)) {
      return;
    }

    setRemovingMember(memberId);
    
    try {
      await boardsApi.removeMember(board._id, memberId);
      
      // Cập nhật danh sách thành viên với animation
      const updatedMembers = boardMembers.filter(member => member._id !== memberId);
      setBoardMembers(updatedMembers);
      
      // Hiển thị thông báo thành công
      setError(null);
      // Có thể thay thế bằng toast notification
      alert(`✅ Đã xóa ${memberName} khỏi board thành công`);
    } catch (err: any) {
      console.error('Error removing member:', err);
      let errorMessage = 'Có lỗi xảy ra khi xóa thành viên';
      
      if (err.response?.status === 403) {
        errorMessage = 'Bạn không có quyền xóa thành viên khỏi board này';
      } else if (err.response?.status === 404) {
        errorMessage = 'Không tìm thấy thành viên hoặc board';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      alert(errorMessage);
    } finally {
      setRemovingMember(null);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="board-container">
        <div className="board-background" style={{ backgroundImage: `url(${boardBackground})` }} />
        <div className="board-overlay" />
        <div className="relative bg-white/95 backdrop-blur-sm rounded-xl p-8 shadow-2xl z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto" />
          <p className="text-gray-700 mt-4 font-medium">Đang tải bảng...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error && !board) {
    return (
      <div className="board-container">
        <div className="board-background" style={{ backgroundImage: `url(${boardBackground})` }} />
        <div className="board-overlay" />
        <div className="relative bg-white/95 backdrop-blur-sm rounded-xl p-8 shadow-2xl max-w-md w-full z-10 m-4">
          <div className="text-red-600 text-center">
            <AlertCircle size={48} className="mx-auto mb-4" />
            <p className="font-bold text-xl mb-2">Lỗi</p>
            <p className="text-sm text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => loadBoardData(id!)}
              className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="board-container">
      <div className="board-background" style={{ backgroundImage: `url(${boardBackground})` }} />
      <div className="board-overlay" />
      
      <div className="board-content">
        {/* Top Bar */}
        <div className="relative px-8 pt-8 pb-4">
          <div className="flex items-center justify-between max-w-[1920px] mx-auto">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="text-white/90 hover:text-white hover:bg-white/20 p-2.5 rounded-xl transition-all backdrop-blur-sm shadow-lg"
                title="Quay lại"
              >
                <ArrowLeft size={22} />
              </button>
              <div className="bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-xl shadow-lg border border-white/20">
                {editingBoardTitle ? (
                  <input
                    value={boardTitle}
                    onChange={(e) => setBoardTitle(e.target.value)}
                    onBlur={handleUpdateBoardTitle}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleUpdateBoardTitle();
                      if (e.key === "Escape") {
                        setBoardTitle(board?.title || "");
                        setEditingBoardTitle(false);
                      }
                    }}
                    className="text-white text-lg font-bold bg-white/20 border-2 border-white/40 rounded-lg px-3 py-1 outline-none min-w-[200px] placeholder-white/60"
                    placeholder="Tên bảng..."
                    autoFocus
                  />
                ) : (
                  <h1
                    onClick={() => setEditingBoardTitle(true)}
                    className="text-white text-lg font-bold drop-shadow-lg cursor-pointer hover:bg-white/10 px-3 py-1 rounded-lg transition-colors"
                    title="Nhấp để chỉnh sửa"
                  >
                    {board?.title || "Bảng"}
                  </h1>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowMembersModal(true)}
                className="text-white/90 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg border border-white/20"
              >
                <Users size={18} />
                <span className="hidden sm:inline">{boardMembers.length}</span>
              </button>
              <button
                onClick={() => setShowInviteModal(true)}
                className="text-white/90 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg border border-white/20"
              >
                <UserPlus size={18} />
                <span className="hidden sm:inline">Mời</span>
              </button>
              <button
                onClick={() => setShowBackgroundModal(true)}
                className="text-white/90 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg border border-white/20"
              >
                <Image size={18} />
                <span className="hidden sm:inline">Đổi nền</span>
              </button>
              <div className="text-sm text-white/90 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl font-medium shadow-lg border border-white/20">
                {username}
              </div>
            </div>
          </div>
        </div>

        {/* Lists */}
        <div className="relative px-8 pb-8 overflow-x-auto">
          <div className="flex space-x-5 min-w-max max-w-[1920px] mx-auto">
            {lists.map((list) => (
              <div
                key={list._id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, list._id)}
                className="w-80 flex-shrink-0 bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20"
              >
                <div className="px-5 py-4 border-b border-white/20 flex items-center justify-between">
                  {editingList === list._id ? (
                    <input
                      value={editingListTitle}
                      onChange={(e) => setEditingListTitle(e.target.value)}
                      onBlur={() => handleUpdateListTitle(list._id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleUpdateListTitle(list._id);
                        if (e.key === "Escape") setEditingList(null);
                      }}
                      className="flex-1 text-base font-bold border-2 border-blue-400 rounded-xl px-4 py-2 outline-none bg-white"
                      autoFocus
                    />
                  ) : (
                    <h3
                      onClick={() => {
                        setEditingList(list._id);
                        setEditingListTitle(list.title);
                      }}
                      className="flex-1 font-bold text-white text-base cursor-pointer hover:bg-white/10 px-4 py-2 rounded-xl transition-colors drop-shadow-lg"
                    >
                      {list.title}
                    </h3>
                  )}
                  <button
                    onClick={() => handleDeleteList(list._id)}
                    className="text-white/70 hover:text-white hover:bg-red-500/20 p-2 rounded-xl transition-all"
                    title="Xóa danh sách"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="p-4 space-y-3 max-h-[calc(100vh-240px)] overflow-y-auto custom-scrollbar">
                  {cards
                    .filter((c) => c.listId === list._id)
                    .map((card) => {
                      const deadlineStatus = getDeadlineStatus(card.dueDate ?? undefined, card.isCompleted);
                      const cardColor = card.labels?.[0];
                      
                      return (
                        <div
                          key={card._id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, card, list._id)}
                          onClick={() => handleOpenCardDetail(card)}
                          className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl p-4 cursor-pointer group relative transition-all hover:scale-[1.02] ${
                            card.isCompleted ? 'opacity-80' : ''
                          }`}
                          style={cardColor ? { borderLeft: `5px solid ${cardColor}` } : {}}
                        >
                          <h4 className={`text-base text-gray-800 font-semibold pr-8 leading-snug mb-2 ${
                            card.isCompleted ? 'line-through text-gray-500' : ''
                          }`}>
                            {card.title}
                          </h4>
                          
                          {card.isCompleted && (
                            <div className="mb-2">
                              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-lg">
                                <CheckCircle2 size={12} />
                                Đã hoàn thành
                              </span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 flex-wrap">
                            {card.description && (
                              <span className="text-xs text-gray-600 flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-lg font-medium">
                                <Tag size={11} />
                                Mô tả
                              </span>
                            )}
                            
                            {deadlineStatus && !card.isCompleted && (
                              <span className={`text-xs flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold shadow-sm ${deadlineStatus.bgColor} ${deadlineStatus.color}`}>
                                {deadlineStatus.icon}
                                {card.dueDate && formatDateTime(card.dueDate)}
                              </span>
                            )}
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCard(card._id);
                            }}
                            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-red-500 hover:text-white hover:bg-red-500 p-1.5 rounded-lg transition-all shadow-lg"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      );
                    })}

                  {showNewCard === list._id ? (
                    <div className="bg-white rounded-2xl shadow-lg p-4">
                      <textarea
                        value={newCardTitle}
                        onChange={(e) => setNewCardTitle(e.target.value)}
                        placeholder="Nhập tiêu đề thẻ..."
                        className="w-full text-base border-none outline-none resize-none font-medium"
                        rows={2}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleAddCard(list._id);
                          }
                          if (e.key === "Escape") {
                            setShowNewCard(null);
                            setNewCardTitle("");
                          }
                        }}
                      />
                      <div className="flex items-center space-x-2 mt-3">
                        <button
                          onClick={() => handleAddCard(list._id)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-xl transition-colors font-semibold shadow-lg"
                        >
                          Thêm thẻ
                        </button>
                        <button
                          onClick={() => {
                            setShowNewCard(null);
                            setNewCardTitle("");
                          }}
                          className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-xl transition-colors"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowNewCard(list._id)}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl text-base transition-all font-medium"
                    >
                      <Plus size={18} />
                      <span>Thêm thẻ</span>
                    </button>
                  )}
                </div>
              </div>
            ))}

            {showNewList ? (
              <div className="w-80 flex-shrink-0 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-5 border border-white/30">
                <input
                  type="text"
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  placeholder="Nhập tên danh sách..."
                  className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 font-semibold"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddList();
                    if (e.key === "Escape") {
                      setShowNewList(false);
                      setNewListTitle("");
                    }
                  }}
                />
                <div className="flex items-center space-x-2 mt-4">
                  <button
                    onClick={handleAddList}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-xl transition-colors font-semibold shadow-lg"
                  >
                    Thêm danh sách
                  </button>
                  <button
                    onClick={() => {
                      setShowNewList(false);
                      setNewListTitle("");
                    }}
                    className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-xl transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowNewList(true)}
                className="w-80 flex-shrink-0 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-2xl p-6 flex items-center justify-center space-x-3 text-white transition-all shadow-xl border border-white/20 hover:border-white/40"
              >
                <Plus size={24} />
                <span className="font-semibold text-lg">Thêm danh sách</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Members Modal */}
      {showMembersModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-slideUp">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users className="text-blue-600" size={20} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Thành viên bảng</h2>
                </div>
                <button
                  onClick={() => setShowMembersModal(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
                
              </div>

              {board && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-sm text-blue-900 font-medium">
                    Chủ sở hữu bảng có thể mời và xóa thành viên khỏi board.
                  </p>
                </div>
              )}

              <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                {boardMembers.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Chưa có thành viên nào</p>
                ) : (
                  boardMembers.map((member) => (
                    <div
                      key={member._id}
                      className={`flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-300 ${
                        removingMember === member._id ? 'opacity-50 scale-95' : ''
                      }`}
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                        {(member.username || "U").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{member.username || "Không rõ"}</p>
                          {board && member._id === board.owner && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              Chủ sở hữu
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{member.email || "Không rõ"}</p>
                      </div>
                      <div>
                        
                        {/* Chỉ hiển thị nút xóa nếu người dùng hiện tại là chủ sở hữu board và không phải là chính họ */}
                        {board && board.owner === userId && member._id !== userId && (
                          <button
                            onClick={() => removeMember(member._id)}
                            disabled={removingMember === member._id}
                            className={`px-3 py-1 text-white rounded text-sm transition-all flex items-center gap-1.5 ${
                              removingMember === member._id
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-red-500 hover:bg-red-600 hover:shadow-md'
                            }`}
                          >
                            {removingMember === member._id ? (
                              <>
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Đang xóa...</span>
                              </>
                            ) : (
                              <>
                                <Trash2 size={14} />
                                <span>Xóa</span>
                              </>
                            )}
                          </button>
                        )}
                        
                        {/* Hiển thị nút xóa cho tất cả thành viên (trừ chính họ) để test - TẠM THỜI */}
                        {member._id !== userId && (
                          <button
                            onClick={() => removeMember(member._id)}
                            disabled={removingMember === member._id}
                            className={`px-3 py-1 text-white rounded text-sm transition-all flex items-center gap-1.5 ${
                              removingMember === member._id
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-orange-500 hover:bg-orange-600 hover:shadow-md'
                            }`}
                          >
                            {removingMember === member._id ? (
                              <>
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Đang xóa...</span>
                              </>
                            ) : (
                              <>
                                <Trash2 size={14} />
                                <span>Xóa</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                      
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-slideUp">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Mail className="text-blue-600" size={20} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Mời thành viên</h2>
                </div>
                <button
                  onClick={handleCloseInviteModal}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {inviteSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <CheckCircle2 className="text-green-600" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Đã thêm thành công!</h3>
                  <p className="text-gray-600">
                    <span className="font-semibold">{inviteEmail}</span>
                    <br />đã được thêm vào bảng
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Email người dùng
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="example@email.com"
                        disabled={inviteLoading}
                        className="w-full px-4 py-3 pl-11 border-2 border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !inviteLoading) handleSendInvite();
                          if (e.key === "Escape") handleCloseInviteModal();
                        }}
                        autoFocus
                      />
                      <Mail className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                    </div>
                    {error && (
                      <p className="text-red-600 text-xs mt-2 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {error}
                      </p>
                    )}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                    <div className="flex gap-3">
                      <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
                      <div>
                        <p className="text-sm text-blue-900 font-medium mb-1">
                          Thêm thành viên vào bảng
                        </p>
                        <p className="text-xs text-blue-700">
                          Người dùng với email này sẽ được thêm ngay vào bảng nếu đã đăng ký tài khoản.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleCloseInviteModal}
                      disabled={inviteLoading}
                      className="flex-1 px-5 py-3 text-gray-700 hover:bg-gray-100 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleSendInvite}
                      disabled={inviteLoading || !inviteEmail.trim()}
                      className="flex-1 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      {inviteLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Đang thêm...
                        </>
                      ) : (
                        <>
                          <Send size={18} />
                          Thêm thành viên
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Background Modal */}
      {showBackgroundModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Chọn hình nền</h2>
                <button
                  onClick={() => setShowBackgroundModal(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {BACKGROUND_IMAGES.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleChangeBackground(img)}
                    className={`relative h-32 rounded-xl overflow-hidden transition-all shadow-md hover:shadow-xl ${
                      boardBackground === img
                        ? "ring-4 ring-blue-500 ring-offset-2 scale-105"
                        : "hover:scale-105"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Hình nền ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {boardBackground === img && (
                      <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                        <div className="bg-blue-500 text-white p-2 rounded-full">
                          <Check size={20} />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Card Detail Modal */}
      {selectedCard && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedCard.title}</h2>
                  <p className="text-sm text-gray-500">
                    trong danh sách <span className="font-medium">{lists.find(l => l._id === selectedCard.listId)?.title}</span>
                  </p>
                  {selectedCard.createdBy && (
                    <p className="text-xs text-gray-500 mt-1">
                      Tạo bởi: <span className="font-medium">{selectedCard.createdBy}</span>
                    </p>
                  )}
                </div>
                <button
                  onClick={handleCloseCardModal}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-6">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={cardCompleted}
                      onChange={(e) => setCardCompleted(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                      cardCompleted
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-300 group-hover:border-green-500'
                    }`}>
                      {cardCompleted && <Check size={16} className="text-white" />}
                    </div>
                  </div>
                  <span className={`text-base font-medium transition-colors ${
                    cardCompleted ? 'text-green-600' : 'text-gray-700'
                  }`}>
                    {cardCompleted ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}
                  </span>
                </label>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Màu nhãn
                </label>
                <div className="flex gap-2 flex-wrap">
                  {LABEL_COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setSelectedColor(color.value)}
                      className={`w-20 h-10 rounded-lg relative transition-all ${color.bg} ${
                        selectedColor === color.value ? "ring-2 ring-offset-2 ring-blue-500 scale-110" : "hover:scale-105"
                      }`}
                      title={color.name}
                    >
                      {selectedColor === color.value && (
                        <Check className="absolute inset-0 m-auto text-white drop-shadow-lg" size={18} />
                      )}
                    </button>
                  ))}
                  <button
                    onClick={() => setSelectedColor("")}
                    className="w-20 h-10 rounded-lg border-2 border-gray-300 hover:bg-gray-100 transition-colors text-xs font-medium text-gray-600"
                  >
                    Không
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <Calendar className="inline mr-2" size={16} />
                  Hạn chót
                </label>
                <input
                  type="datetime-local"
                  value={cardDeadline}
                  onChange={(e) => setCardDeadline(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
                {cardDeadline && new Date(cardDeadline) < new Date() && !cardCompleted && (
                  <p className="text-red-600 text-xs mt-2 flex items-center gap-1 bg-red-50 px-3 py-2 rounded-lg font-medium">
                    <AlertCircle size={14} />
                    Đã quá hạn - nhiệm vụ này đã trễ hạn
                  </p>
                )}
                {cardDeadline && (
                  <p className="text-gray-500 text-xs mt-2">
                    Hiển thị: {formatDateTime(cardDeadline)}
                  </p>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Mô tả
                </label>
                <textarea
                  value={cardDescription}
                  onChange={(e) => setCardDescription(e.target.value)}
                  placeholder="Thêm mô tả chi tiết hơn..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none transition-all"
                  rows={6}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {cardDescription.length} ký tự
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleCloseCardModal}
                  className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveCardDetails}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                >
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .board-container {
          position: relative;
          min-height: 100vh;
          height: 100%;
          width: 100%;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .board-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center center;
          background-repeat: no-repeat;
          background-attachment: fixed;
          z-index: 0;
        }

        .board-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.3);
          z-index: 1;
        }

        .board-content {
          position: relative;
          width: 100%;
          min-height: 100vh;
          z-index: 2;
          display: flex;
          flex-direction: column;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
}
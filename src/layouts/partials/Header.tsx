import { Link, useNavigate } from 'react-router';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, Check, X, User, LogOut, LayoutDashboard, Search, TrendingUp } from 'lucide-react';
import { boardsApi, type BoardInvitation, type Board } from '../../api/boards';

const Header = () => {
  const { isAuthenticated, username, logout } = useAuth();
  const navigate = useNavigate();
  
  const [invitations, setInvitations] = useState<BoardInvitation[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Board[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadInvitations();
      loadBoards();
      const interval = setInterval(loadInvitations, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = boards.filter(board =>
        board.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchQuery, boards]);

  const loadInvitations = async () => {
    try {
      const invitationsData = await boardsApi.getMyInvitations();
      setInvitations(invitationsData);
    } catch (err) {
      console.error('Error loading invitations:', err);
    }
  };

  const loadBoards = async () => {
    try {
      const boardsData = await boardsApi.getMyBoards();
      setBoards(boardsData);
    } catch (err) {
      console.error('Error loading boards:', err);
    }
  };

  const acceptInvitation = async (invitationId: string) => {
    try {
      await boardsApi.acceptInvitation(invitationId);
      loadInvitations();
      loadBoards();
    } catch (err) {
      console.error('Error accepting invitation:', err);
      alert('Có lỗi xảy ra khi chấp nhận lời mời');
    }
  };

  const rejectInvitation = async (invitationId: string) => {
    try {
      await boardsApi.rejectInvitation(invitationId);
      loadInvitations();
    } catch (err) {
      console.error('Error rejecting invitation:', err);
      alert('Có lỗi xảy ra khi từ chối lời mời');
    }
  };

  const handleBoardClick = (boardId: string) => {
    setSearchQuery('');
    setShowSearchResults(false);
    navigate(`/boards/${boardId}`);
  };

  return (
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md transform group-hover:scale-110 transition-all duration-200">
              <LayoutDashboard className="text-white" size={20} strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Ballo
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          {isAuthenticated && (
            <div className="hidden md:block flex-1 max-w-xl mx-8" ref={searchRef}>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm bảng..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />

                {/* Search Results Dropdown */}
                {showSearchResults && searchQuery && (
                  <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden max-h-96 overflow-y-auto">
                    {searchResults.length > 0 ? (
                      <>
                        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                          <p className="text-xs font-semibold text-gray-500 uppercase">
                            {searchResults.length} kết quả
                          </p>
                        </div>
                        {searchResults.map((board) => (
                          <button
                            key={board._id}
                            onClick={() => handleBoardClick(board._id)}
                            className="w-full px-4 py-3 hover:bg-blue-50 transition-colors text-left border-b border-gray-100 last:border-b-0 group"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                  {board.title}
                                </h4>
                                <div className="flex items-center space-x-3 mt-1">
                                  <span className="text-xs text-gray-500">
                                    {board.members.length} thành viên
                                  </span>
                                  <span className="text-xs text-gray-400">•</span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(board.createdAt).toLocaleDateString('vi-VN')}
                                  </span>
                                </div>
                              </div>
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center group-hover:from-blue-200 group-hover:to-indigo-200 transition-all">
                                <TrendingUp size={16} className="text-blue-600" />
                              </div>
                            </div>
                          </button>
                        ))}
                      </>
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Search size={24} className="text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500">Không tìm thấy bảng nào</p>
                        <p className="text-xs text-gray-400 mt-1">Thử từ khóa khác</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                    aria-label="Notifications"
                  >
                    <Bell size={20} strokeWidth={2} />
                    {invitations.length > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                        {invitations.length > 9 ? '9+' : invitations.length}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Bell size={18} className="text-white" />
                            <h3 className="text-white font-bold text-sm">Lời mời tham gia</h3>
                          </div>
                          {invitations.length > 0 && (
                            <span className="bg-white/25 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full">
                              {invitations.length}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                          <div className="px-4 py-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto"></div>
                          </div>
                        ) : invitations.length === 0 ? (
                          <div className="px-4 py-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                              <Bell size={32} className="text-gray-400" />
                            </div>
                            <p className="text-sm font-medium text-gray-900 mb-1">Không có thông báo mới</p>
                            <p className="text-xs text-gray-500">Bạn sẽ nhận được thông báo tại đây</p>
                          </div>
                        ) : (
                          invitations.map((invitation) => (
                            <div
                              key={invitation._id}
                              className="px-4 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                            >
                              <div className="mb-3">
                                <h4 className="font-bold text-gray-900 text-sm mb-1.5 line-clamp-1">
                                  {invitation.boardId?.title || 'Board không tồn tại'}
                                </h4>
                                <p className="text-xs text-gray-600">
                                  <span className="text-gray-500">Từ:</span>{' '}
                                  <span className="font-semibold text-blue-600">
                                    {invitation.inviterId?.username || 'Unknown'}
                                  </span>
                                </p>
                                {invitation.message && (
                                  <p className="text-xs text-gray-600 mt-2 p-2.5 bg-blue-50 rounded-lg border-l-3 border-blue-500 italic">
                                    "{invitation.message}"
                                  </p>
                                )}
                                <p className="text-xs text-gray-400 mt-2 flex items-center space-x-1">
                                  <span>📅</span>
                                  <span>
                                    {new Date(invitation.createdAt).toLocaleDateString('vi-VN', { 
                                      day: '2-digit', 
                                      month: '2-digit', 
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </p>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => acceptInvitation(invitation._id)}
                                  className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-lg transition-all shadow-sm hover:shadow-md"
                                >
                                  <Check size={14} strokeWidth={2.5} />
                                  <span>Chấp nhận</span>
                                </button>
                                <button
                                  onClick={() => rejectInvitation(invitation._id)}
                                  className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-all"
                                >
                                  <X size={14} strokeWidth={2.5} />
                                  <span>Từ chối</span>
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {invitations.length > 0 && (
                        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                          <Link
                            to="/invitations"
                            onClick={() => setShowNotifications(false)}
                            className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center justify-center space-x-1 group"
                          >
                            <span>Xem tất cả</span>
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* User Menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2.5 px-3 py-2 rounded-xl hover:bg-gray-100 transition-all group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
                      <User size={16} className="text-white" strokeWidth={2.5} />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">
                      {username}
                    </span>
                  </button>

                  {/* User Dropdown */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-4 border-b border-gray-200 bg-gradient-to-br from-gray-50 to-blue-50">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                            <User size={20} className="text-white" strokeWidth={2.5} />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 mb-0.5">Xin chào 👋</p>
                            <p className="text-sm font-bold text-gray-900 truncate">{username}</p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={logout}
                        className="w-full px-4 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2.5 group"
                      >
                        <LogOut size={18} strokeWidth={2} />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  to="/login"
                  className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-all"
                >
                  Đăng Nhập
                </Link>
                <Link 
                  to="/register"
                  className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all"
                >
                  Đăng Ký
                </Link>
              </div>
            )}
          </div>

          {/* Mobile - Coming soon indicator */}
          <div className="md:hidden text-xs text-gray-400">
            Mobile view
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
import { Link } from 'react-router';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Check, X, Bell } from 'lucide-react';
import { boardsApi, type BoardInvitation } from '../../api/boards';

const Header = () => {
  const { isAuthenticated, username, logout } = useAuth();
  const [invitations, setInvitations] = useState<BoardInvitation[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadInvitations();
      // Poll for new invitations every 30 seconds
      const interval = setInterval(loadInvitations, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      const invitationsData = await boardsApi.getMyInvitations();
      setInvitations(invitationsData);
    } catch (err) {
      console.error('Error loading invitations:', err);
    } finally {
      setLoading(false);
    }
  };

  const acceptInvitation = async (invitationId: string) => {
    try {
      await boardsApi.acceptInvitation(invitationId);
      loadInvitations();
      // Optionally trigger a refresh of boards
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

  return (
    <header className="w-full relative z-[100]">
      <nav className="border-gray-200 bg-gray-900 py-2.5">
        <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between px-4">
          <Link to="/" className="flex items-center">
            <span className="self-center text-xl font-semibold whitespace-nowrap text-white">
              Ballo
            </span>
          </Link>
          
          <div className="flex items-center lg:order-2 space-x-2">
            {isAuthenticated ? (
              <>
                {/* Notifications Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="relative flex items-center justify-center rounded-lg border-2 border-white px-3 py-2 text-white hover:bg-gray-700 focus:ring-4 focus:ring-gray-300 focus:outline-none transition-colors"
                  >
                    <Bell size={20} />
                    {invitations.length > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                        {invitations.length > 9 ? '9+' : invitations.length}
                      </span>
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
                      <div className="bg-gray-900 px-4 py-3 border-b border-gray-700">
                        <div className="flex items-center justify-between">
                          <h3 className="text-white font-semibold">Lời mời tham gia</h3>
                          {invitations.length > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                              {invitations.length}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                          <div className="px-4 py-8 text-center text-gray-500">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                          </div>
                        ) : invitations.length === 0 ? (
                          <div className="px-4 py-8 text-center text-gray-500">
                            <Mail size={48} className="mx-auto mb-3 opacity-30" />
                            <p className="text-sm">Không có lời mời nào</p>
                          </div>
                        ) : (
                          invitations.map((invitation) => (
                            <div
                              key={invitation._id}
                              className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900 text-sm mb-1">
                                    {invitation.boardId?.title || 'Board không tồn tại'}
                                  </h4>
                                  <p className="text-xs text-gray-600">
                                    Từ: <span className="font-medium">{invitation.inviterId?.username || 'Unknown'}</span>
                                  </p>
                                  {invitation.message && (
                                    <p className="text-xs text-gray-500 mt-1 italic">
                                      "{invitation.message}"
                                    </p>
                                  )}
                                  <p className="text-xs text-gray-400 mt-1">
                                    {new Date(invitation.createdAt).toLocaleDateString('vi-VN')}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2 mt-2">
                                <button
                                  onClick={() => acceptInvitation(invitation._id)}
                                  className="flex items-center space-x-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs rounded transition-colors"
                                >
                                  <Check size={14} />
                                  <span>Chấp nhận</span>
                                </button>
                                <button
                                  onClick={() => rejectInvitation(invitation._id)}
                                  className="flex items-center space-x-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs rounded transition-colors"
                                >
                                  <X size={14} />
                                  <span>Từ chối</span>
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {invitations.length > 0 && (
                        <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
                          <Link
                            to="/invitations"
                            onClick={() => setShowDropdown(false)}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Xem tất cả lời mời →
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <span className="text-white">Xin chào, {username}</span>
                <button 
                  onClick={logout}
                  className="rounded-lg border-2 border-white px-4 py-2 text-sm leading-[24px] font-medium text-white hover:bg-gray-700 focus:ring-4 focus:ring-gray-300 focus:outline-none transition-colors"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/register"
                  className="rounded-lg border-2 border-white px-4 py-2 text-sm leading-[24px] font-medium text-white hover:bg-gray-700 focus:ring-4 focus:ring-gray-300 focus:outline-none transition-colors"
                >
                  Đăng Ký
                </Link>
                <Link 
                  to="/login"
                  className="rounded-lg border-2 border-white px-4 py-2 text-sm leading-[24px] font-medium text-white hover:bg-gray-700 focus:ring-4 focus:ring-gray-300 focus:outline-none transition-colors"
                >
                  Đăng Nhập
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
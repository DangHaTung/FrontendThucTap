import  { useState, useEffect } from 'react';
import { Check, X, Mail, Users } from 'lucide-react';
import { boardsApi, type BoardInvitation } from '../api/boards';

interface InvitationsProps {
  onInvitationAccepted?: () => void;
}

export default function Invitations({ onInvitationAccepted }: InvitationsProps) {
  const [invitations, setInvitations] = useState<BoardInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      setError(null);
      const invitationsData = await boardsApi.getMyInvitations();
      setInvitations(invitationsData);
    } catch (err: any) {
      console.error('Error loading invitations:', err);
      setError('Có lỗi xảy ra khi tải danh sách lời mời');
    } finally {
      setLoading(false);
    }
  };

  const acceptInvitation = async (invitationId: string) => {
    try {
      await boardsApi.acceptInvitation(invitationId);
      alert('Đã chấp nhận lời mời thành công!');
      loadInvitations(); // Reload danh sách
      onInvitationAccepted?.(); // Callback để refresh boards
    } catch (err: any) {
      console.error('Error accepting invitation:', err);
      alert('Có lỗi xảy ra khi chấp nhận lời mời');
    }
  };

  const rejectInvitation = async (invitationId: string) => {
    try {
      await boardsApi.rejectInvitation(invitationId);
      alert('Đã từ chối lời mời');
      loadInvitations(); // Reload danh sách
    } catch (err: any) {
      console.error('Error rejecting invitation:', err);
      alert('Có lỗi xảy ra khi từ chối lời mời');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 flex items-center justify-center">
        <div className="text-white text-xl">Đang tải lời mời...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 flex items-center justify-center">
        <div className="text-white text-xl text-center">
          <div className="mb-4">{error}</div>
          <button 
            onClick={loadInvitations}
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
          <div className="flex items-center space-x-3">
            <Mail className="text-white" size={28} />
            <h1 className="text-2xl font-bold text-white">Lời mời tham gia bảng</h1>
          </div>
        </div>
      </div>

      {/* Invitations List */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {invitations.length === 0 ? (
          <div className="text-center text-white">
            <Mail size={64} className="mx-auto mb-4 opacity-50" />
            <h2 className="text-xl mb-2">Không có lời mời nào</h2>
            <p className="opacity-75">Bạn chưa có lời mời tham gia bảng nào.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {invitations.map((invitation) => (
              <div 
                key={invitation._id}
                className="bg-white bg-opacity-95 backdrop-blur-sm rounded-xl shadow-lg p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <Users size={20} className="text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-800">
                        {invitation.boardId?.title || 'Board không tồn tại'}
                      </h3>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Người mời:</span> {invitation.inviterId?.username || 'Unknown'}
                    </div>
                    
                    {invitation.message && (
                      <div className="text-sm text-gray-600 mb-3">
                        <span className="font-medium">Lời nhắn:</span> {invitation.message}
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500">
                      Được gửi: {new Date(invitation.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => acceptInvitation(invitation._id)}
                      className="flex items-center space-x-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                    >
                      <Check size={16} />
                      <span>Chấp nhận</span>
                    </button>
                    <button
                      onClick={() => rejectInvitation(invitation._id)}
                      className="flex items-center space-x-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                    >
                      <X size={16} />
                      <span>Từ chối</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

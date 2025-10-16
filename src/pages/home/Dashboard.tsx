import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { boardsApi, type Board } from "../../api/boards";
import { Plus, Trash2, X, Palette, Image, Users, Clock, Star } from "lucide-react";

const BACKGROUND_COLORS = [
  { name: "Ocean Blue", value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  { name: "Sunset", value: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
  { name: "Fresh Mint", value: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
  { name: "Green Garden", value: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" },
  { name: "Pink Dream", value: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" },
  { name: "Deep Space", value: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)" },
  { name: "Soft Cloud", value: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)" },
  { name: "Autumn", value: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)" },
];

const BACKGROUND_IMAGES = [
  "https://images.unsplash.com/photo-1557683316-973673baf926?w=800&q=80",
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
  "https://images.unsplash.com/photo-1557683311-eac922347aa1?w=800&q=80",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80",
];

interface BoardBackground {
  type: "color" | "image";
  value: string;
}

interface ExtendedBoard extends Board {
  background?: BoardBackground;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const [boards, setBoards] = useState<ExtendedBoard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [backgroundType, setBackgroundType] = useState<"color" | "image">("color");
  const [selectedColor, setSelectedColor] = useState(BACKGROUND_COLORS[0].value);
  const [selectedImage, setSelectedImage] = useState("");

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await boardsApi.getMyBoards();
      
      // Giữ boards với background mặc định (không dùng localStorage)
      const boardsWithDefaults = data.map((board) => ({
        ...board,
        background: {
          type: "color" as const,
          value: BACKGROUND_COLORS[0].value
        }
      }));
      
      setBoards(boardsWithDefaults);
    } catch (err: any) {
      setError(err.message || "Không thể tải danh sách bảng");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async () => {
    if (!newBoardTitle.trim()) {
      alert("Vui lòng nhập tên bảng");
      return;
    }

    try {
      const newBoard = await boardsApi.createBoard({ title: newBoardTitle });
      
      const background: BoardBackground = {
        type: backgroundType,
        value: backgroundType === "color" ? selectedColor : selectedImage,
      };
      
      setBoards([...boards, { ...newBoard, background }]);
      
      resetModalState();
      setShowCreateModal(false);
    } catch (err) {
      alert("Không thể tạo bảng");
    }
  };

  const resetModalState = () => {
    setNewBoardTitle("");
    setSelectedColor(BACKGROUND_COLORS[0].value);
    setSelectedImage("");
    setBackgroundType("color");
  };

  const handleDeleteBoard = async (boardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!window.confirm("Bạn có chắc muốn xóa bảng này?")) {
      return;
    }

    try {
      await boardsApi.deleteBoard(boardId);
      setBoards(boards.filter((b) => b._id !== boardId));
    } catch (err) {
      alert("Không thể xóa bảng");
    }
  };

  const handleOpenBoard = (board: ExtendedBoard) => {
    navigate(`/boards/${board._id}`);
  };

  const getBoardStyle = (board: ExtendedBoard) => {
    if (board.background?.type === "image") {
      return {
        backgroundImage: `url(${board.background.value})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    }
    return {
      background: board.background?.value || BACKGROUND_COLORS[0].value,
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Bảng của bạn</h1>
              <p className="text-gray-600">
                {loading ? "Đang tải..." : `${boards.length} ${boards.length === 1 ? "bảng" : "bảng"}`}
              </p>
            </div>
            
            {!loading && boards.length > 0 && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Plus size={20} strokeWidth={2.5} />
                Tạo bảng mới
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
              <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-blue-400 border-t-transparent opacity-20"></div>
            </div>
            <p className="text-gray-600 mt-6 font-medium text-lg">Đang tải bảng...</p>
          </div>
        ) : error ? (
          <div className="max-w-md mx-auto mt-20">
            <div className="bg-white rounded-2xl shadow-xl p-8 border-t-4 border-red-500">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X size={32} className="text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Đã xảy ra lỗi</h3>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                  onClick={fetchBoards}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors shadow-lg hover:shadow-xl"
                >
                  Thử lại
                </button>
              </div>
            </div>
          </div>
        ) : boards.length === 0 ? (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="relative mb-8">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                  <Star size={56} className="text-blue-600" strokeWidth={1.5} />
                </div>
                <div className="absolute -top-2 -right-2 w-24 h-24 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-40 animate-pulse"></div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Bắt đầu hành trình của bạn
              </h3>
              <p className="text-gray-600 mb-10 text-lg leading-relaxed">
                Tạo bảng đầu tiên để tổ chức công việc,<br />quản lý dự án và cộng tác hiệu quả
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-xl hover:shadow-2xl hover:scale-105"
              >
                <Plus size={24} strokeWidth={2.5} />
                Tạo bảng đầu tiên
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {boards.map((board) => (
              <article
                key={board._id}
                onClick={() => handleOpenBoard(board)}
                className="group relative h-40 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-lg"
                style={getBoardStyle(board)}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:from-black/90 transition-all"></div>
                
                <div className="relative h-full p-5 flex flex-col justify-between">
                  <h3 className="font-bold text-white text-xl drop-shadow-lg line-clamp-2 leading-tight">
                    {board.title}
                  </h3>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-white/95 font-semibold">
                      <span className="flex items-center gap-1.5 bg-white/25 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-sm">
                        <Users size={14} strokeWidth={2.5} />
                        {board.members.length}
                      </span>
                      <span className="flex items-center gap-1.5 bg-white/25 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-sm">
                        <Clock size={14} strokeWidth={2.5} />
                        {new Date(board.createdAt).toLocaleDateString("vi-VN", { day: "numeric", month: "numeric" })}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleDeleteBoard(board._id, e)}
                      className="opacity-0 group-hover:opacity-100 transition-all bg-red-500/90 backdrop-blur-sm hover:bg-red-600 text-white p-2.5 rounded-lg shadow-lg transform hover:scale-110"
                      title="Xóa bảng"
                    >
                      <Trash2 size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
            
            {/* Create New Board Card */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="h-40 rounded-2xl border-3 border-dashed border-gray-300 hover:border-blue-500 bg-white/50 hover:bg-blue-50/80 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-md group"
            >
              <div className="h-full flex flex-col items-center justify-center gap-3">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 group-hover:from-blue-200 group-hover:to-indigo-200 flex items-center justify-center transition-all group-hover:scale-110 shadow-md">
                  <Plus size={28} className="text-blue-600 group-hover:text-blue-700" strokeWidth={2.5} />
                </div>
                <span className="text-gray-600 group-hover:text-blue-700 font-semibold text-base transition-colors">
                  Tạo bảng mới
                </span>
              </div>
            </button>
          </div>
        )}
      </main>

      {/* Create Board Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Tạo bảng mới</h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetModalState();
                  }}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2.5 rounded-xl transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Preview */}
              <div className="mb-8">
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Xem trước
                </label>
                <div
                  className="h-44 rounded-2xl overflow-hidden shadow-xl relative"
                  style={{
                    background:
                      backgroundType === "image" && selectedImage
                        ? `url(${selectedImage})`
                        : selectedColor,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  <div className="relative h-full p-6 flex items-end">
                    <p className="text-white text-2xl font-bold drop-shadow-lg">
                      {newBoardTitle || "Bảng chưa có tên"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Title Input */}
              <div className="mb-8">
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Tên bảng <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newBoardTitle}
                  onChange={(e) => setNewBoardTitle(e.target.value)}
                  placeholder="vd: Chiến dịch Marketing Q4, Phát triển sản phẩm..."
                  className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900 font-medium text-lg"
                  autoFocus
                  maxLength={50}
                />
                <p className="text-sm text-gray-500 mt-2 font-medium">
                  {newBoardTitle.length}/50 ký tự
                </p>
              </div>

              {/* Background Type Tabs */}
              <div className="mb-8">
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Loại nền
                </label>
                <div className="flex gap-3 bg-gray-100 p-2 rounded-xl">
                  <button
                    onClick={() => setBackgroundType("color")}
                    className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-semibold transition-all ${
                      backgroundType === "color"
                        ? "bg-white text-blue-600 shadow-lg scale-105"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Palette size={20} strokeWidth={2.5} />
                    Màu gradient
                  </button>
                  <button
                    onClick={() => setBackgroundType("image")}
                    className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-semibold transition-all ${
                      backgroundType === "image"
                        ? "bg-white text-blue-600 shadow-lg scale-105"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Image size={20} strokeWidth={2.5} />
                    Hình ảnh
                  </button>
                </div>
              </div>

              {/* Color Selection */}
              {backgroundType === "color" && (
                <div className="mb-8">
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Chọn gradient
                  </label>
                  <div className="grid grid-cols-4 gap-4">
                    {BACKGROUND_COLORS.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setSelectedColor(color.value)}
                        className={`h-20 rounded-xl transition-all shadow-lg hover:shadow-xl ${
                          selectedColor === color.value
                            ? "ring-4 ring-blue-500 ring-offset-4 scale-110"
                            : "hover:scale-105"
                        }`}
                        style={{ background: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Image Selection */}
              {backgroundType === "image" && (
                <div className="mb-8">
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Chọn hình ảnh
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {BACKGROUND_IMAGES.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(img)}
                        className={`h-28 rounded-xl overflow-hidden transition-all shadow-lg hover:shadow-xl ${
                          selectedImage === img
                            ? "ring-4 ring-blue-500 ring-offset-4 scale-110"
                            : "hover:scale-105"
                        }`}
                      >
                        <img
                          src={img}
                          alt={`Nền ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-6 border-t-2 border-gray-100">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetModalState();
                  }}
                  className="px-8 py-3 text-gray-700 hover:bg-gray-100 rounded-xl font-semibold transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateBoard}
                  disabled={!newBoardTitle.trim()}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl disabled:shadow-none hover:scale-105 disabled:scale-100"
                >
                  Tạo bảng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
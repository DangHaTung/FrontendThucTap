import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { boardsApi, type Board } from "../../api/boards";
import { Plus, Trash2, X, Palette, Image, Users, Clock, LayoutGrid } from "lucide-react";

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

interface ExtendedBoard extends Board {
  backgroundColor?: string;
  backgroundImage?: string;
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
      
      const boardsWithBackground = data.map((board) => {
        const savedBg = localStorage.getItem(`board-bg-${board._id}`);
        if (savedBg) {
          try {
            const bg = JSON.parse(savedBg);
            // Nếu savedBg là string (format mới từ BoardDetail), chuyển về format cũ
            if (typeof bg === 'string') {
              return { ...board, backgroundImage: bg };
            }
            return { ...board, ...bg };
          } catch {
            // Nếu không parse được, coi như là image URL
            return { ...board, backgroundImage: savedBg };
          }
        }
        return board;
      });
      
      setBoards(boardsWithBackground);
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
      
      const backgroundData = {
        backgroundColor: backgroundType === "color" ? selectedColor : undefined,
        backgroundImage: backgroundType === "image" ? selectedImage : undefined,
      };
      localStorage.setItem(`board-bg-${newBoard._id}`, JSON.stringify(backgroundData));
      
      setBoards([...boards, { ...newBoard, ...backgroundData }]);
      
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
      localStorage.removeItem(`board-bg-${boardId}`);
    } catch (err) {
      alert("Không thể xóa bảng");
    }
  };

  const handleOpenBoard = (board: ExtendedBoard) => {
    // Lưu background theo format mới (string URL) cho BoardDetail
    if (board.backgroundImage) {
      localStorage.setItem(`board-bg-${board._id}`, board.backgroundImage);
    } else if (board.backgroundColor) {
      // Nếu là gradient color, chuyển sang image mặc định
      localStorage.setItem(`board-bg-${board._id}`, BACKGROUND_IMAGES[0]);
    }
    navigate(`/boards/${board._id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                <LayoutGrid size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Không gian làm việc</h1>
                <p className="text-sm text-gray-500">
                  {boards.length} {boards.length === 1 ? "bảng" : "bảng"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <Plus size={18} />
              Tạo bảng
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-gray-600 mt-4 font-medium">Đang tải bảng...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700 max-w-md mx-auto">
            <p className="font-semibold text-lg mb-1">Lỗi</p>
            <p className="text-sm">{error}</p>
            <button
              onClick={fetchBoards}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Thử lại
            </button>
          </div>
        ) : boards.length === 0 ? (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Plus size={40} className="text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Chưa có bảng nào
              </h3>
              <p className="text-gray-600 mb-8 text-lg">
                Tạo bảng đầu tiên để bắt đầu tổ chức công việc
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
              >
                <Plus size={20} />
                Tạo bảng đầu tiên
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {boards.map((board) => (
              <article
                key={board._id}
                onClick={() => handleOpenBoard(board)}
                className="group relative h-32 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-lg"
                style={{
                  background: board.backgroundImage
                    ? `url(${board.backgroundImage})`
                    : board.backgroundColor || BACKGROUND_COLORS[0].value,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent group-hover:from-black/80 transition-all"></div>
                
                <div className="relative h-full p-4 flex flex-col justify-between">
                  <h3 className="font-bold text-white text-lg drop-shadow-lg line-clamp-2">
                    {board.title}
                  </h3>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-white/90 font-medium">
                      <span className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-md">
                        <Users size={13} />
                        {board.members.length}
                      </span>
                      <span className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-md">
                        <Clock size={13} />
                        {new Date(board.createdAt).toLocaleDateString("vi-VN", { day: "numeric", month: "numeric" })}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleDeleteBoard(board._id, e)}
                      className="opacity-0 group-hover:opacity-100 transition-all bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg shadow-lg transform hover:scale-110"
                      title="Xóa bảng"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Create Board Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Tạo bảng mới</h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetModalState();
                  }}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Preview */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Xem trước bảng
                </label>
                <div
                  className="h-36 rounded-xl overflow-hidden shadow-lg relative"
                  style={{
                    background:
                      backgroundType === "image" && selectedImage
                        ? `url(${selectedImage})`
                        : selectedColor,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                  <div className="relative h-full p-6 flex items-end">
                    <p className="text-white text-xl font-bold drop-shadow-lg">
                      {newBoardTitle || "Bảng chưa có tên"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Title Input */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Tên bảng *
                </label>
                <input
                  type="text"
                  value={newBoardTitle}
                  onChange={(e) => setNewBoardTitle(e.target.value)}
                  placeholder="vd: Chiến dịch Marketing, Kế hoạch Q1..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900"
                  autoFocus
                  maxLength={50}
                />
                <p className="text-xs text-gray-500 mt-2">
                  {newBoardTitle.length}/50 ký tự
                </p>
              </div>

              {/* Background Type Tabs */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Kiểu nền
                </label>
                <div className="flex gap-2 bg-gray-100 p-1.5 rounded-lg">
                  <button
                    onClick={() => setBackgroundType("color")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                      backgroundType === "color"
                        ? "bg-white text-blue-600 shadow-md"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Palette size={18} />
                    Màu gradient
                  </button>
                  <button
                    onClick={() => setBackgroundType("image")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                      backgroundType === "image"
                        ? "bg-white text-blue-600 shadow-md"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Image size={18} />
                    Hình ảnh
                  </button>
                </div>
              </div>

              {/* Color Selection */}
              {backgroundType === "color" && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Chọn màu
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {BACKGROUND_COLORS.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setSelectedColor(color.value)}
                        className={`h-16 rounded-xl transition-all shadow-md hover:shadow-lg ${
                          selectedColor === color.value
                            ? "ring-4 ring-blue-500 ring-offset-2 scale-105"
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
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Chọn hình ảnh
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {BACKGROUND_IMAGES.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(img)}
                        className={`h-24 rounded-xl overflow-hidden transition-all shadow-md hover:shadow-lg ${
                          selectedImage === img
                            ? "ring-4 ring-blue-500 ring-offset-2 scale-105"
                            : "hover:scale-105"
                        }`}
                      >
                        <img
                          src={img}
                          alt={`Tùy chọn nền ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetModalState();
                  }}
                  className="px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateBoard}
                  disabled={!newBoardTitle.trim()}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg disabled:shadow-none"
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
      `}</style>
    </div>
  );
};

export default Dashboard;
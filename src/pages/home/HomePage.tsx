import { Link } from "react-router-dom";

const HomePage = () => {
  const token = localStorage.getItem("token");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-pink-500 to-purple-600 r">
      <h1 className="text-4xl font-bold mb-4 text-white">Trang chủ</h1>
      <p className="text-black mb-6 font-bold text-2xl">
        Chào mừng bạn đến trang web của chúng tôi!
      </p>

      {token ? (
        <Link
          to="/dashboard"
          className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          Đến bảng của bạn
        </Link>
      ) : (
        <Link
          to="/login"
          className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          Đăng nhập để vào bảng của bạn
        </Link>
      )}
    </div>
  );
};

export default HomePage;

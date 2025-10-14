import { Link } from "react-router-dom";

const HomePage = () => {
  const token = localStorage.getItem("token");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4 text-indigo-600">Trang chủ</h1>
      <p className="text-gray-600 mb-6">
        Chào mừng bạn đến trang web của chúng tôi!
      </p>

      {token ? (
        <Link
          to="/dashboard"
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Đến bảng của bạn
        </Link>
      ) : (
        <Link
          to="/login"
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Đăng nhập để vào bảng của bạn
        </Link>
      )}
    </div>
  );
};

export default HomePage;

import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import PrivateRoute from "./routes/PrivateRoute";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import HomePage from "./pages/home/HomePage";
import Dashboard from "./pages/home/Dashboard";
import BoardDetail from "./pages/home/BoardDetail"; // 👈 trang chi tiết board
import ClientLayout from "./layouts/ClientLayout";

const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div>Đang tải...</div>;

  return (
    <Routes>
      {/* 🔹 Trang chủ (ai cũng vào được) */}
      <Route path="/" element={<HomePage />} />

      {/* 🔹 Login/Register (ẩn nếu đã đăng nhập) */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />}
      />

      {/* 🔹 Các trang cần đăng nhập */}
      <Route
        element={
          <PrivateRoute>
            <ClientLayout />
          </PrivateRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/boards/:id" element={<BoardDetail />} /> {/* 👈 thêm route chi tiết */}
      </Route>

      {/* 🔹 Route không tồn tại → quay về trang chủ */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => (
  <AuthProvider>
    <AppRoutes />
  </AuthProvider>
);

export default App;

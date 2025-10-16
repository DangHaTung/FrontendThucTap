import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../../api/authApi";

const Register = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate không để trống
    if (!form.username || !form.email || !form.password || !form.confirmPassword) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    // Validate confirmPassword
    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu và xác nhận mật khẩu không khớp");
      return;
    }

    setLoading(true);
    try {
      // Gửi lên backend chỉ 3 trường
      await authApi.register(form.email, form.password, form.username);

      alert("Đăng ký thành công! Hãy đăng nhập để tiếp tục.");
      navigate("/login");
    } catch (err: any) {
      setError(err.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form onSubmit={handleRegister} className="bg-white p-6 rounded-xl shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center mb-4 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">Đăng ký</h2>

        {error && <p className="text-red-500 text-sm text-center mb-3">{error}</p>}

        <input
          type="text"
          name="username"
          placeholder="Tên người dùng"
          value={form.username}
          onChange={handleChange}
          className="w-full border p-2 rounded mb-3 focus:ring focus:ring-indigo-200 outline-none"
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full border p-2 rounded mb-3 focus:ring focus:ring-indigo-200 outline-none"
        />

        <input
          type="password"
          name="password"
          placeholder="Mật khẩu"
          value={form.password}
          onChange={handleChange}
          className="w-full border p-2 rounded mb-3 focus:ring focus:ring-indigo-200 outline-none"
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Xác nhận mật khẩu"
          value={form.confirmPassword}
          onChange={handleChange}
          className="w-full border p-2 rounded mb-4 focus:ring focus:ring-indigo-200 outline-none"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 rounded transition hover:from-pink-600 hover:to-purple-700 disab"
        >
          {loading ? "Đang xử lý..." : "Đăng ký"}
        </button>

        <p className="text-sm text-center mt-3 text-gray-600">
          Đã có tài khoản?{" "}
          <Link to="/login" className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent hover:underline">
            Đăng nhập
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;

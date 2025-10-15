import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginSchema, type ILogin } from "../../schema/login";
import { authApi } from "../../api/authApi";
import { useAuth } from "../../contexts/AuthContext";
import { jwtDecode } from "jwt-decode"; // ✅ import để decode token

const Login = () => {
  const [form, setForm] = useState<ILogin>({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate form
    const result = loginSchema.safeParse(form);
    if (!result.success) {
      setError(result.error.errors[0].message);
      setLoading(false);
      return;
    }

    try {
      // 1️⃣ Gọi API login
      const data = await authApi.login(form.email, form.password);
      if (!data.token) throw new Error(data.message || "Đăng nhập thất bại");

      // 2️⃣ Giải mã token để lấy thông tin user
      const decoded: any = jwtDecode(data.token);
      const userData = {
        username: decoded.username,
        email: decoded.email,
        token: data.token,
      };

      // 3️⃣ Lưu vào localStorage và context
      localStorage.setItem("user", JSON.stringify(userData));
      login(userData);

      // 4️⃣ Chuyển sang dashboard
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded-xl shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center mb-4 text-indigo-600">Đăng nhập</h2>

        {error && <p className="text-red-500 text-sm text-center mb-3">{error}</p>}

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
          className="w-full border p-2 rounded mb-4 focus:ring focus:ring-indigo-200 outline-none"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>

        <p className="text-sm text-center mt-3 text-gray-600">
          Chưa có tài khoản?{" "}
          <Link to="/register" className="text-indigo-600 hover:underline">
            Đăng ký
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;

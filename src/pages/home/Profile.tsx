import { useEffect, useState } from "react";
import { authApi } from "../../api/authApi";
import { useAuth } from "../../contexts/AuthContext";

interface MeResponse {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
}

const Profile = () => {
  const { user, setUser } = useAuth();
  const [me, setMe] = useState<MeResponse | null>(null);
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const data = await authApi.me();
        setMe(data);
        setUsername(data.username || "");
        setAvatar(data.avatar || "");
      } catch (e: any) {
        setError(e?.response?.data?.message || e.message || "Không thể tải hồ sơ");
      }
    };
    fetchMe();
  }, []);

  const handleSave = async () => {
    setError("");
    setSuccess("");
    if (password && password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }
    setSaving(true);
    try {
      const payload: any = { username, avatar };
      if (password) {
        payload.password = password;
        payload.confirmPassword = confirmPassword;
      }
      const updated = await authApi.updateMe(payload);
      setMe(updated);
      setSuccess("Cập nhật hồ sơ thành công");
      // đồng bộ username/avatar vào context (nếu đang lưu ở localStorage)
      if (user) {
        const newUser = { ...user, username: updated.username, avatar: updated.avatar } as any;
        localStorage.setItem("user", JSON.stringify(newUser));
        setUser(newUser);
      }
      setPassword("");
      setConfirmPassword("");
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || "Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Hồ sơ cá nhân</h1>
      {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
      {success && <div className="text-green-600 text-sm mb-3">{success}</div>}
      {me ? (
        <div className="space-y-5 bg-white p-5 rounded-xl border">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input value={me.email} disabled className="w-full border rounded-lg px-3 py-2 bg-gray-100 text-gray-600" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tên người dùng</label>
            <input value={username} onChange={(e)=>setUsername(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">URL Avatar</label>
            <input value={avatar} onChange={(e)=>setAvatar(e.target.value)} placeholder="https://..." className="w-full border rounded-lg px-3 py-2" />
            <div className="mt-3 flex items-center gap-3">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                {avatar ? (
                  <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-gray-500">No Avatar</span>
                )}
              </div>
              <span className="text-xs text-gray-500">Xem trước</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Mật khẩu mới</label>
              <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Xác nhận mật khẩu</label>
              <input type="password" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={handleSave} disabled={saving} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50">
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </div>
      ) : (
        <div>Đang tải...</div>
      )}
    </div>
  );
};

export default Profile;



import React, { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../api/authApi";

export interface User {
  _id: string;
  email: string;
  username?: string;
  token: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  username: string;
  userId: string;
  isAuthenticated: boolean;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  login: (user: User) => void; // ✅ thêm login
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Khi load trang, kiểm tra token trong localStorage
  useEffect(() => {
    const init = async () => {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
          // nếu thiếu avatar hoặc _id, cố gắng gọi /me để đồng bộ
          if (token && (!parsed._id || !parsed.avatar)) {
            try {
              const me = await authApi.me();
              const merged = { ...parsed, _id: me._id || parsed._id, username: me.username || parsed.username, email: me.email || parsed.email, avatar: me.avatar };
              setUser(merged);
              localStorage.setItem("user", JSON.stringify(merged));
            } catch {}
          }
        } catch {
          setUser(null);
        }
      } else if (token) {
        // có token nhưng chưa có user -> cố gắng lấy /me
        try {
          const me = await authApi.me();
          const hydrated: User = { _id: me._id, email: me.email, username: me.username, avatar: me.avatar, token };
          setUser(hydrated);
          localStorage.setItem("user", JSON.stringify(hydrated));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    init();
  }, []);


  const login = async (userData: User) => {
    setUser(userData);
    localStorage.setItem("token", userData.token);
    localStorage.setItem("user", JSON.stringify(userData));
    // đồng bộ avatar và id từ /me nếu có
    try {
      const me = await authApi.me();
      const merged = { ...userData, _id: me._id || userData._id, username: me.username || userData.username, email: me.email || userData.email, avatar: me.avatar };
      setUser(merged);
      localStorage.setItem("user", JSON.stringify(merged));
    } catch {}
  };

const logout = () => {
  setUser(null);
  localStorage.removeItem("user");
    localStorage.removeItem("token");

};



  return (
    <AuthContext.Provider
      value={{
        user,
        username: user?.username || "",
        userId: user?._id || "",
        isAuthenticated: !!user,
        loading,
        setUser,
        login,   // ✅ cung cấp login
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

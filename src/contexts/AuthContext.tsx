import React, { createContext, useContext, useEffect, useState } from "react";

export interface User {
  email: string;
  username?: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  username: string;
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
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    try {
      setUser(JSON.parse(storedUser)); // ✅ userData đầy đủ {email, username, token}
    } catch {
      setUser(null);
    }
  } else {
    setUser(null);
  }
  setLoading(false);
}, []);


  const login = (userData: User) => {
  setUser(userData);
    localStorage.setItem("token", userData.token);

  localStorage.setItem("user", JSON.stringify(userData));
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

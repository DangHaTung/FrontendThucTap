import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  username: string;
  user: User | null;
  login: (username: string, token: string, userData?: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Kiểm tra token và username trong localStorage khi component mount
    const token = localStorage.getItem('token');
    const savedUsername = localStorage.getItem('username');
    const savedUser = localStorage.getItem('user');
    
    console.log('AuthContext useEffect - token:', token);
    console.log('AuthContext useEffect - username:', savedUsername);
    
    if (token && savedUsername) {
      setIsAuthenticated(true);
      setUsername(savedUsername);
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    }
  }, []);

  const login = (username: string, token: string, userData?: User) => {
    console.log('AuthContext login - saving token:', token);
    console.log('AuthContext login - saving username:', username);
    
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    }
    setIsAuthenticated(true);
    setUsername(username);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUsername('');
    setUser(null);
  };

  const value: AuthContextType = {
    isAuthenticated,
    username,
    user,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};


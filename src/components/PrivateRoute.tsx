import React, { type ReactNode } from 'react'
import { Navigate } from 'react-router'
import { useAuth } from "../contexts/AuthContext";

interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>;
}

export default PrivateRoute

import React from 'react';
import { Navigate } from 'react-router-dom';

interface RequireAuthProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
  redirectTo: string;
}

const RequireAuth = ({ children, isAuthenticated, redirectTo }: RequireAuthProps) => {
  return isAuthenticated ? <>{children}</> : <Navigate to={redirectTo} replace />;
};

export default RequireAuth;

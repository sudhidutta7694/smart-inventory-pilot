
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  warehouse: 'South' | 'East';
  role: 'admin';
}

interface AuthContextType {
  user: User | null;
  login: (warehouse: 'South' | 'East') => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const mockUsers: Record<string, User> = {
  'admin_south': {
    id: 'admin_south',
    name: 'Sarah Johnson',
    warehouse: 'South',
    role: 'admin'
  },
  'admin_east': {
    id: 'admin_east',
    name: 'Mike Chen',
    warehouse: 'East',
    role: 'admin'
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (warehouse: 'South' | 'East') => {
    const userId = `admin_${warehouse.toLowerCase()}`;
    const userData = mockUsers[userId];
    setUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};


import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  name: string;
  warehouse: 'South';
  role: 'admin';
}

interface AuthSouthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthSouthContext = createContext<AuthSouthContextType | undefined>(undefined);

export const useAuthSouth = () => {
  const context = useContext(AuthSouthContext);
  if (!context) {
    throw new Error('useAuthSouth must be used within an AuthSouthProvider');
  }
  return context;
};

const mockSouthUser: User = {
  id: 'admin_south',
  username: 'admin1',
  name: 'Sarah Johnson',
  warehouse: 'South',
  role: 'admin'
};

const mockSouthPassword = 'south123pass';

export const AuthSouthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('south_session');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved south user:', error);
        localStorage.removeItem('south_session');
      }
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (username === mockSouthUser.username && password === mockSouthPassword) {
      setUser(mockSouthUser);
      localStorage.setItem('south_session', JSON.stringify(mockSouthUser));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('south_session');
  };

  const isAuthenticated = !!user;

  return (
    <AuthSouthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthSouthContext.Provider>
  );
};

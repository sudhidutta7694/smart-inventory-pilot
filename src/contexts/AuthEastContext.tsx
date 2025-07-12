
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  name: string;
  warehouse: 'East';
  role: 'admin';
}

interface AuthEastContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthEastContext = createContext<AuthEastContextType | undefined>(undefined);

export const useAuthEast = () => {
  const context = useContext(AuthEastContext);
  if (!context) {
    throw new Error('useAuthEast must be used within an AuthEastProvider');
  }
  return context;
};

const mockEastUser: User = {
  id: 'admin_east',
  username: 'admin2',
  name: 'Mike Chen',
  warehouse: 'East',
  role: 'admin'
};

const mockEastPassword = 'east123pass';

export const AuthEastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('east_session');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved east user:', error);
        localStorage.removeItem('east_session');
      }
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (username === mockEastUser.username && password === mockEastPassword) {
      setUser(mockEastUser);
      localStorage.setItem('east_session', JSON.stringify(mockEastUser));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('east_session');
  };

  const isAuthenticated = !!user;

  return (
    <AuthEastContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthEastContext.Provider>
  );
};

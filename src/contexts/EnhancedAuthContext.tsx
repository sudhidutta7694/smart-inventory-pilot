
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  name: string;
  warehouse: 'South' | 'East';
  role: 'admin';
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  switchUser: (warehouse: 'South' | 'East') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const mockUsers: User[] = [
  {
    id: 'admin_south',
    username: 'admin1',
    name: 'Sarah Johnson',
    warehouse: 'South',
    role: 'admin'
  },
  {
    id: 'admin_east',
    username: 'admin2', 
    name: 'Mike Chen',
    warehouse: 'East',
    role: 'admin'
  }
];

const mockPasswords: Record<string, string> = {
  'admin1': 'south123pass',
  'admin2': 'east123pass'
};

export const EnhancedAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Try to restore user from localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('currentUser');
      }
    }

    // Listen for storage changes (cross-tab authentication)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'currentUser') {
        if (e.newValue) {
          try {
            setUser(JSON.parse(e.newValue));
          } catch (error) {
            console.error('Error parsing user from storage event:', error);
          }
        } else {
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = mockUsers.find(u => u.username === username);
    const validPassword = mockPasswords[username] === password;
    
    if (foundUser && validPassword) {
      setUser(foundUser);
      
      // Store in localStorage with warehouse-specific key to allow simultaneous sessions
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      localStorage.setItem(`user_${foundUser.warehouse.toLowerCase()}`, JSON.stringify(foundUser));
      
      return true;
    }
    
    return false;
  };

  const logout = () => {
    if (user) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem(`user_${user.warehouse.toLowerCase()}`);
    }
    setUser(null);
  };

  const switchUser = (warehouse: 'South' | 'East') => {
    const savedUser = localStorage.getItem(`user_${warehouse.toLowerCase()}`);
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        localStorage.setItem('currentUser', savedUser);
      } catch (error) {
        console.error('Error switching user:', error);
      }
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, switchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

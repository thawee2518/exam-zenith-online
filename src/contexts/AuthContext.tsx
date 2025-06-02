
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types/exam';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: Omit<User, 'id' | 'createdAt'>) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('examSystemUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Mock authentication - in real app, this would call an API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Demo users
    const mockUsers: User[] = [
      {
        id: '1',
        username: 'admin',
        email: 'admin@example.com',
        role: 'admin',
        name: 'ผู้ดูแลระบบ',
        createdAt: new Date()
      },
      {
        id: '2',
        username: 'student',
        email: 'student@example.com',
        role: 'student',
        name: 'นักเรียน',
        createdAt: new Date()
      }
    ];
    
    const foundUser = mockUsers.find(u => u.username === username && password === 'password');
    
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('examSystemUser', JSON.stringify(foundUser));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('examSystemUser');
  };

  const register = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<boolean> => {
    setIsLoading(true);
    
    // Mock registration
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    
    setUser(newUser);
    localStorage.setItem('examSystemUser', JSON.stringify(newUser));
    setIsLoading(false);
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

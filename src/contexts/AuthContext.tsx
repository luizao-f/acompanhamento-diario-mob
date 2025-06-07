
import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const auth = localStorage.getItem('billings_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    if (username === 'LuizGenilza' && password === 'Acesso2025') {
      setIsAuthenticated(true);
      localStorage.setItem('billings_auth', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('billings_auth');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

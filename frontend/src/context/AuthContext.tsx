import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserResponse } from '../types';
import { getHealth } from '../api';

interface AuthContextType {
  user: UserResponse | null;
  token: string | null;
  login: (token: string, user: UserResponse) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Check local storage on mount
    const storedToken = localStorage.getItem('mavrick_token');
    const storedUser = localStorage.getItem('mavrick_user');
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('mavrick_token');
        localStorage.removeItem('mavrick_user');
      }
    }
  }, []);

  const login = (newToken: string, newUser: UserResponse) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('mavrick_token', newToken);
    localStorage.setItem('mavrick_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('mavrick_token');
    localStorage.removeItem('mavrick_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

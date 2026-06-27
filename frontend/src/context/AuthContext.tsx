import React, { createContext, useContext, useState } from 'react';
import type { UserResponse } from '../types';

const ADMIN_EMAILS = new Set([
  'teammistaketechnologies@gmail.com',
])

interface AuthContextType {
  user: UserResponse | null;
  token: string | null;
  login: (token: string, user: UserResponse) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Read persisted session synchronously so the very first render already knows
// whether the user is authenticated — prevents auth guards from bouncing a
// logged-in user to /login on a page refresh.
function readStored(): { token: string | null; user: UserResponse | null } {
  try {
    const token = localStorage.getItem('mavrick_token');
    const rawUser = localStorage.getItem('mavrick_user');
    if (token && rawUser) return { token, user: JSON.parse(rawUser) };
  } catch {
    localStorage.removeItem('mavrick_token');
    localStorage.removeItem('mavrick_user');
  }
  return { token: null, user: null };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(() => readStored().user);
  const [token, setToken] = useState<string | null>(() => readStored().token);

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

  const isAdmin = !!user && ADMIN_EMAILS.has(user.email.toLowerCase());

  return (
    <AuthContext.Provider value={{
      user, token, login, logout,
      isAuthenticated: !!token,
      isAdmin,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

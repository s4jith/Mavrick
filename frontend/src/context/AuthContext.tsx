import React, { createContext, useContext, useEffect, useState } from 'react';
import { onIdTokenChanged, signOut } from 'firebase/auth';
import type { User as FbUser } from 'firebase/auth';
import { auth } from '../firebase';
import { syncProfile } from '../api';
import type { UserResponse } from '../types';

const ADMIN_EMAILS = new Set([
  'teammistaketechnologies@gmail.com',
])

interface AuthContextType {
  user: UserResponse | null;
  token: string | null;
  login: (token: string, user: UserResponse) => void;  // legacy/compat path
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapUser(fb: FbUser): UserResponse {
  return {
    id: fb.uid,
    email: fb.email || '',
    name: fb.displayName || (fb.email ? fb.email.split('@')[0] : 'Commander'),
  };
}

// Optimistic synchronous read of the last session so a page refresh doesn't
// bounce a logged-in user to /login before Firebase rehydrates.
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
  const [loading, setLoading] = useState(true);

  // Firebase is the source of truth. onIdTokenChanged fires on sign-in,
  // sign-out AND silent token refresh — so localStorage stays current and
  // api.ts (which reads mavrick_token) always sends a fresh ID token.
  useEffect(() => {
    const unsub = onIdTokenChanged(auth, async (fb) => {
      if (fb) {
        const t = await fb.getIdToken();
        const u = mapUser(fb);
        setToken(t);
        setUser(u);
        localStorage.setItem('mavrick_token', t);
        localStorage.setItem('mavrick_user', JSON.stringify(u));
        // Upsert the profile in Firestore (best-effort; token already stored).
        syncProfile().catch(() => { /* offline / backend down — non-fatal */ });
      } else {
        setToken(null);
        setUser(null);
        localStorage.removeItem('mavrick_token');
        localStorage.removeItem('mavrick_user');
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // Legacy compat: lets the custom OAuth callback set a session directly.
  const login = (newToken: string, newUser: UserResponse) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('mavrick_token', newToken);
    localStorage.setItem('mavrick_user', JSON.stringify(newUser));
  };

  const logout = () => {
    signOut(auth).catch(() => { /* ignore */ });
    setToken(null);
    setUser(null);
    localStorage.removeItem('mavrick_token');
    localStorage.removeItem('mavrick_user');
  };

  const isAdmin = !!user && ADMIN_EMAILS.has(user.email.toLowerCase());

  return (
    <AuthContext.Provider value={{
      user, token, login, logout,
      isAuthenticated: !!user,
      isAdmin,
      loading,
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

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, DocumentChunk } from '@/types';
import { api } from '@/lib/api';
import { isDemoMode } from '@/lib/data';

interface AppContextType {
  currentUser: User | null;
  currentRole: 'student' | 'admin' | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  isDemo: boolean;
  login: (email: string, password?: string, role?: 'student' | 'admin') => Promise<User>;
  register: (data: {
    email: string;
    password: string;
    full_name: string;
    role: 'student' | 'admin';
    room_number?: string;
    block_name?: string;
  }) => Promise<User>;
  logout: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  activeEvidenceChunk: DocumentChunk | null;
  openEvidenceDrawer: (chunk: DocumentChunk) => void;
  closeEvidenceDrawer: () => void;
}

const STORAGE_KEY = 'hosteliq_demo_session';

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeEvidenceChunk, setActiveEvidenceChunk] = useState<DocumentChunk | null>(null);

  const isDemo = isDemoMode();

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: User = JSON.parse(stored);
        if (parsed && parsed.id) {
          setCurrentUser(parsed);
          api.setActiveUser(parsed.id);
        }
      }
    } catch (e) {
      console.error('Failed to load session:', e);
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  const login = async (email: string, password?: string, role?: 'student' | 'admin'): Promise<User> => {
    const user = await api.login({ email, password, role });
    setCurrentUser(user);
    api.setActiveUser(user.id);
    try {
      // Browser-session-scoped: clears when tab/browser closes. Passwords are never stored.
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ id: user.id, email: user.email, full_name: user.full_name, role: user.role }));
    } catch (e) {
      console.error('Failed to save session:', e);
    }
    return user;
  };

  const register = async (data: {
    email: string;
    password: string;
    full_name: string;
    role: 'student' | 'admin';
    room_number?: string;
    block_name?: string;
  }): Promise<User> => {
    const user = await api.register(data);
    setCurrentUser(user);
    api.setActiveUser(user.id);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ id: user.id, email: user.email, full_name: user.full_name, role: user.role }));
    } catch (e) {
      console.error('Failed to save session:', e);
    }
    return user;
  };

  const logout = () => {
    setCurrentUser(null);
    api.setActiveUser('');
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear session:', e);
    }
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  const openEvidenceDrawer = (chunk: DocumentChunk) => {
    setActiveEvidenceChunk(chunk);
  };

  const closeEvidenceDrawer = () => {
    setActiveEvidenceChunk(null);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentRole: currentUser?.role || null,
        isAuthenticated: !!currentUser,
        isLoadingAuth,
        isDemo,
        login,
        register,
        logout,
        mobileMenuOpen,
        setMobileMenuOpen,
        activeEvidenceChunk,
        openEvidenceDrawer,
        closeEvidenceDrawer,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

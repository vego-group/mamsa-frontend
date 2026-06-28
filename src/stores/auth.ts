/**
 * Auth Store (Zustand)
 *
 * Holds the current user session in-memory.
 * Persisted to localStorage so it survives page reloads.
 * No password is ever stored — only OTP-issued tokens.
 */
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setSession: (user: User, accessToken: string, refreshToken: string) => void;
  updateUser: (patch: Partial<User>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      setSession: (user, accessToken, refreshToken) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('mamsa.accessToken', accessToken);
          localStorage.setItem('mamsa.refreshToken', refreshToken);
        }
        set({ user, accessToken, isAuthenticated: true });
      },

      updateUser: (patch) =>
        set((s) => ({ user: s.user ? { ...s.user, ...patch } : s.user })),

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('mamsa.accessToken');
          localStorage.removeItem('mamsa.refreshToken');
        }
        set({ user: null, accessToken: null, isAuthenticated: false });
      },
    }),
    {
      name: 'mamsa.auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ user: s.user, accessToken: s.accessToken, isAuthenticated: s.isAuthenticated }),
    },
  ),
);

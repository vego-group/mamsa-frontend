/**
 * Auth Store (Zustand)
 *
 * Holds the current user session in-memory, persisted to localStorage so it
 * survives page reloads. USER DATA ONLY — the access/refresh tokens live
 * exclusively in the TokenManager (`@/lib/auth/tokens`); keeping a second
 * copy here previously went stale after the first silent refresh.
 * No password is ever stored — only OTP-issued tokens.
 */
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { tokenManager } from '@/lib/auth/tokens';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setSession: (user: User, accessToken: string, refreshToken: string) => void;
  updateUser: (patch: Partial<User>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setSession: (user, accessToken, refreshToken) => {
        tokenManager.setTokens(accessToken, refreshToken);
        set({ user, isAuthenticated: true });
      },

      updateUser: (patch) =>
        set((s) => ({ user: s.user ? { ...s.user, ...patch } : s.user })),

      logout: () => {
        tokenManager.clear();
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'mamsa.auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }),
    },
  ),
);

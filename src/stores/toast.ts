'use client';

/**
 * Minimal global toast — a single message at a time, auto-dismissed by
 * ToastHost. Used for background-action failures with no dedicated inline
 * error slot (e.g. a stale-state recovery banner, a resend rate-limit hit).
 */
import { create } from 'zustand';

interface ToastState {
  message: string | null;
  show: (message: string) => void;
  clear: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  show: (message) => set({ message }),
  clear: () => set({ message: null }),
}));

export const showToast = (message: string) => useToastStore.getState().show(message);

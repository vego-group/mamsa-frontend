'use client';

import { create } from 'zustand';

type AuthDialog = 'login' | 'register' | null;

interface UiState {
  authDialog: AuthDialog;
  /** Phone number to prefill when the register dialog opens (e.g. bounced over from login). */
  prefillPhone: string;
  openAuth: (which: AuthDialog, prefillPhone?: string) => void;
  closeAuth: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  authDialog: null,
  prefillPhone: '',
  openAuth: (which, prefillPhone = '') => set({ authDialog: which, prefillPhone }),
  closeAuth: () => set({ authDialog: null }),
}));

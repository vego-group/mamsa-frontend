'use client';

import { create } from 'zustand';

type AuthDialog = 'login' | 'register' | null;

interface UiState {
  authDialog: AuthDialog;
  openAuth: (which: AuthDialog) => void;
  closeAuth: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  authDialog: null,
  openAuth: (which) => set({ authDialog: which }),
  closeAuth: () => set({ authDialog: null }),
}));

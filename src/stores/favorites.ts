'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface FavoritesState {
  unitIds: string[];
  toggle: (unitId: string) => void;
  has: (unitId: string) => boolean;
  clear: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      unitIds: [],
      toggle: (unitId) =>
        set((s) => ({
          unitIds: s.unitIds.includes(unitId)
            ? s.unitIds.filter((id) => id !== unitId)
            : [...s.unitIds, unitId],
        })),
      has: (unitId) => get().unitIds.includes(unitId),
      clear: () => set({ unitIds: [] }),
    }),
    { name: 'mamsa.favorites', storage: createJSONStorage(() => localStorage) },
  ),
);

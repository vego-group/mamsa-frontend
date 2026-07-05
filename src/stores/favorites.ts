'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { favoritesApi } from '@/lib/api/client';
import { useAuthStore } from '@/stores/auth';

interface FavoritesState {
  unitIds: string[];
  has: (unitId: string) => boolean;
  toggle: (unitId: string) => void;
  /** Merge guest (local) favourites with the server after login. */
  sync: () => Promise<void>;
  /** Clear favourites on logout. */
  reset: () => void;
}

const isAuthed = () => useAuthStore.getState().isAuthenticated;

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      unitIds: [],

      has: (unitId) => get().unitIds.includes(unitId),

      toggle: (unitId) => {
        const wasFav = get().unitIds.includes(unitId);
        // Optimistic local update — the UI reacts instantly for guests and users alike.
        set((s) => ({
          unitIds: wasFav ? s.unitIds.filter((id) => id !== unitId) : [...s.unitIds, unitId],
        }));

        if (!isAuthed()) return;
        const request = wasFav ? favoritesApi.remove(unitId) : favoritesApi.add(unitId);
        request.catch(() => {
          // Revert the optimistic change if the server rejects it.
          set((s) => ({
            unitIds: wasFav ? [...s.unitIds, unitId] : s.unitIds.filter((id) => id !== unitId),
          }));
        });
      },

      sync: async () => {
        if (!isAuthed()) return;
        const local = get().unitIds;
        const server = await favoritesApi.list().catch(() => [] as string[]);
        // Push any guest-only favourites up to the account.
        await Promise.all(
          local.filter((id) => !server.includes(id)).map((id) => favoritesApi.add(id).catch(() => {})),
        );
        set({ unitIds: Array.from(new Set([...server, ...local])) });
      },

      reset: () => set({ unitIds: [] }),
    }),
    { name: 'mamsa.favorites', storage: createJSONStorage(() => localStorage) },
  ),
);

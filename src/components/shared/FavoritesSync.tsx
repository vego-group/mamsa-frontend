'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/auth';
import { useFavoritesStore } from '@/stores/favorites';

/**
 * Bridges auth state → favourites store (renders nothing).
 * - On login (incl. a persisted session on first load): merge local + server.
 * - On logout: clear favourites.
 * - Guests are left untouched so their local favourites persist.
 */
export function FavoritesSync() {
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  const sync = useFavoritesStore((s) => s.sync);
  const reset = useFavoritesStore((s) => s.reset);
  // Start from `false` so a persisted logged-in session still triggers a sync on mount.
  const wasAuth = useRef(false);

  useEffect(() => {
    if (isAuth && !wasAuth.current) sync();
    else if (!isAuth && wasAuth.current) reset();
    wasAuth.current = isAuth;
  }, [isAuth, sync, reset]);

  return null;
}

'use client';

import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_SETTINGS, SETTINGS_KEY, type ReaderSettings } from './types';

export function useReaderSettings() {
  const [settings, setSettings] = useState<ReaderSettings>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
    } catch {
      // Ignore unreadable storage; defaults are fine.
    }
    setHydrated(true);
  }, []);

  const update = useCallback((patch: Partial<ReaderSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      } catch {
        // Non-fatal: settings just will not persist.
      }
      return next;
    });
  }, []);

  return { settings, update, hydrated };
}

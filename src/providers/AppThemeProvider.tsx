import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useState } from 'react';

import { storageService } from '@/src/services/storageService';
import { ThemePreference } from '@/src/types/app';

type AppThemePreferenceContextValue = {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => Promise<void>;
};

const AppThemePreferenceContext = createContext<AppThemePreferenceContextValue | null>(null);

export function AppThemeProvider({ children }: PropsWithChildren) {
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    let cancelled = false;

    void storageService.getThemePreference().then((savedPreference) => {
      if (!cancelled) setPreferenceState(savedPreference);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const setPreference = useCallback(async (nextPreference: ThemePreference) => {
    setPreferenceState(nextPreference);
    await storageService.saveThemePreference(nextPreference);
  }, []);

  return <AppThemePreferenceContext.Provider value={{ preference, setPreference }}>{children}</AppThemePreferenceContext.Provider>;
}

export function useThemePreference() {
  const context = useContext(AppThemePreferenceContext);
  if (!context) throw new Error('useThemePreference must be used within AppThemeProvider');
  return context;
}

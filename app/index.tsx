import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';

import { storageService } from '@/src/services/storageService';

export default function IndexScreen() {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function resolveInitialRoute() {
      const [accessToken, hasProfile, doneOnBoarding] = await Promise.all([
        storageService.getAccessToken(),
        storageService.getHasProfile(),
        storageService.getDoneOnBoarding(),
      ]);

      if (cancelled) {
        return;
      }

      if (!accessToken) {
        setInitialRoute('/(auth)/login');
        return;
      }

      if (hasProfile === false) {
        setInitialRoute('/(auth)/signup');
        return;
      }

      if (doneOnBoarding === false) {
        setInitialRoute('/(auth)/onboarding');
        return;
      }

      setInitialRoute('/(tabs)/home');
    }

    void resolveInitialRoute();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!initialRoute) {
    return null;
  }

  return <Redirect href={initialRoute as never} />;
}

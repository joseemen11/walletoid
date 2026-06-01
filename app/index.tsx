import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';

import { loadCiudadaniaSession } from '@/src/features/auth/ciudadania/ciudadaniaSessionStorage';
import { LoadingState } from '@/src/shared/components/LoadingState';
import { Screen } from '@/src/shared/components/Screen';

export default function IndexRoute() {
  const [nextRoute, setNextRoute] = useState<
    '/auth/login' | '/identity/check' | null
  >(null);

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      try {
        const session = await loadCiudadaniaSession();

        if (!mounted) {
          return;
        }

        setNextRoute(session ? '/identity/check' : '/auth/login');
      } catch {
        if (mounted) {
          setNextRoute('/auth/login');
        }
      }
    }

    void checkSession();

    return () => {
      mounted = false;
    };
  }, []);

  if (nextRoute) {
    return <Redirect href={nextRoute} />;
  }

  return (
    <Screen>
      <LoadingState
        title="Revisando tu sesión"
        description="Un momento, estamos preparando tu acceso."
      />
    </Screen>
  );
}

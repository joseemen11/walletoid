import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';

import { loadCiudadaniaSession } from '@/src/features/auth/ciudadania/ciudadaniaSessionStorage';
import { useSplashInit } from '@/src/features/wira/useSplashInit';
import { useWira } from '@/src/features/wira/useWira';
import { LoadingState } from '@/src/shared/components/LoadingState';
import { Screen } from '@/src/shared/components/Screen';
import { Alert } from 'react-native';

export default function IndexRoute() {
  const [nextRoute, setNextRoute] = useState<
    '/auth/login' | '/identity/check' | null
  >(null);
  const { initWira } = useWira();
  const {
    downloadMessage,
    initializeApp
  } = useSplashInit();

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      try {
        await initWira();
        console.log('Wira initialized');
        await initializeApp();
      } catch (error: any) {
        Alert.alert('Error initializing app:', error.message || 'Unknown error');
      }

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
        description={downloadMessage || "Un momento, estamos preparando tu acceso."}
      />
    </Screen>
  );
}

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { colors } from '@/src/shared/theme/colors';

export default function RootLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerBackTitle: 'Inicio',
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: colors.background,
          },
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
        <Stack.Screen name="identity/check" options={{ headerShown: false }} />
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="wallet/index" options={{ title: 'Mi wallet' }} />
        <Stack.Screen
          name="wallet/[credentialId]"
          options={{ title: 'Detalle de credencial' }}
        />
        <Stack.Screen name="demo/index" options={{ title: 'Demo de emision' }} />
        <Stack.Screen
          name="presentation/scan"
          options={{ title: 'Presentar credencial' }}
        />
        <Stack.Screen
          name="presentation/select-credential"
          options={{ title: 'Seleccionar credencial' }}
        />
        <Stack.Screen
          name="presentation/result"
          options={{ title: 'Resultado de presentacion' }}
        />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}

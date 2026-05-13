import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

export default function RootLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerBackTitle: 'Inicio',
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: '#F4F7FB',
          },
          contentStyle: {
            backgroundColor: '#F4F7FB',
          },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
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

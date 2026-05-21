import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/src/shared/components/AppButton';
import { Screen } from '@/src/shared/components/Screen';
import { spacing } from '@/src/shared/theme/spacing';
import { typography } from '@/src/shared/theme/typography';

function readParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default function CiudadaniaAuthCallbackRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    code?: string;
    error?: string;
    error_description?: string;
  }>();
  const code = readParam(params.code);
  const error = readParam(params.error);
  const errorDescription = readParam(params.error_description);

  useEffect(() => {
    if (!code || error) {
      return undefined;
    }

    const timeout = setTimeout(() => {
      router.replace('/');
    }, 1200);

    return () => {
      clearTimeout(timeout);
    };
  }, [code, error, router]);

  if (error) {
    return (
      <Screen>
        <View style={styles.content}>
          <Text style={styles.title}>No se pudo completar el inicio de sesion.</Text>
          <Text style={styles.description}>
            {errorDescription || error}
          </Text>
          <AppButton title="Volver al inicio" onPress={() => router.replace('/')} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.content}>
        <Text style={styles.title}>Procesando inicio de sesion...</Text>
        <Text style={styles.description}>
          La app esta recibiendo la respuesta de Ciudadania Digital.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
  },
  title: {
    color: '#0F1720',
    fontSize: typography.heading,
    fontWeight: '600',
    lineHeight: 28,
  },
  description: {
    color: '#425466',
    fontSize: typography.body,
    lineHeight: 24,
  },
});

import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { useVerifierPresentationFlow } from '../../application/useVerifierPresentationFlow';
import { VerifierQrScanner } from '../components/VerifierQrScanner';
import { AppButton } from '@/src/shared/components/AppButton';
import { AppCard } from '@/src/shared/components/AppCard';
import { Screen } from '@/src/shared/components/Screen';
import { spacing } from '@/src/shared/theme/spacing';
import { typography } from '@/src/shared/theme/typography';

export function ScanVerifierQrScreen() {
  const router = useRouter();
  const { error, parseAndStoreRequest, setError } = useVerifierPresentationFlow();

  const handleScanned = useCallback(
    (value: string) => {
      try {
        parseAndStoreRequest(value);
        router.push('/presentation/select-credential');
      } catch (scanError) {
        setError(
          scanError instanceof Error
            ? scanError.message
            : 'No fue posible leer la solicitud de presentacion.',
        );
      }
    },
    [parseAndStoreRequest, router, setError],
  );

  return (
    <Screen>
      <Text style={styles.title}>Escanear solicitud</Text>

      <AppCard>
        <Text style={styles.description}>
          Escanea el código QR mostrado por el verificador.
        </Text>
      </AppCard>

      <VerifierQrScanner onScanned={handleScanned} />

      {error ? (
        <AppCard>
          <Text style={styles.errorText}>{error}</Text>
        </AppCard>
      ) : null}

      <View style={styles.actions}>
        <AppButton
          title="Volver al inicio"
          onPress={() => router.replace('/')}
          variant="secondary"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: '#0F1720',
    fontSize: typography.title,
    fontWeight: '700',
  },
  description: {
    color: '#425466',
    fontSize: typography.body,
    lineHeight: 24,
  },
  errorText: {
    color: '#8B1E1E',
    fontSize: typography.body,
    lineHeight: 24,
  },
  actions: {
    gap: spacing.md,
  },
});

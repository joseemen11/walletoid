import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { useVerifierPresentationFlow } from '../../application/useVerifierPresentationFlow';
import { PresentationResultCard } from '../components/PresentationResultCard';
import { AppButton } from '@/src/shared/components/AppButton';
import { AppCard } from '@/src/shared/components/AppCard';
import { Screen } from '@/src/shared/components/Screen';
import { spacing } from '@/src/shared/theme/spacing';
import { typography } from '@/src/shared/theme/typography';

export function PresentationResultScreen() {
  const router = useRouter();
  const { result, error, resetFlow } = useVerifierPresentationFlow();

  const goHome = () => {
    resetFlow();
    router.replace('/');
  };

  const goWallet = () => {
    resetFlow();
    router.replace('/wallet');
  };

  return (
    <Screen>
      <Text style={styles.title}>Resultado de presentación</Text>

      {result ? <PresentationResultCard result={result} /> : null}

      {!result && error ? (
        <AppCard>
          <Text style={styles.errorText}>{error}</Text>
        </AppCard>
      ) : null}

      {!result && !error ? (
        <AppCard>
          <Text style={styles.description}>
            No hay resultado de presentación disponible. Vuelve a escanear la
            solicitud.
          </Text>
          <AppButton
            title="Escanear solicitud"
            onPress={() => router.replace('/presentation/scan')}
            variant="secondary"
          />
        </AppCard>
      ) : null}

      <View style={styles.actions}>
        <AppButton title="Volver al inicio" onPress={goHome} />
        <AppButton
          title="Volver a wallet"
          onPress={goWallet}
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

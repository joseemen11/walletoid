import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { useWalletCredentials } from '../../application/useWalletCredentials';
import { CredentialCard } from '../components/CredentialCard';
import { EmptyWalletState } from '@/src/features/wallet/presentation/components/EmptyWalletState';
import { AppButton } from '@/src/shared/components/AppButton';
import { AppCard } from '@/src/shared/components/AppCard';
import { Screen } from '@/src/shared/components/Screen';
import { spacing } from '@/src/shared/theme/spacing';
import { typography } from '@/src/shared/theme/typography';

export function WalletHomeScreen() {
  const router = useRouter();
  const {
    credentials,
    isLoading,
    error,
    seedDemoCredential,
    clearCredentials,
  } = useWalletCredentials();

  return (
    <Screen>
      <Text style={styles.title}>Mi wallet</Text>

      <AppCard>
        <Text style={styles.description}>
          Esta PoC guarda credenciales verificables de prueba usando
          persistencia local segura con SecureStore.
        </Text>
      </AppCard>

      {error ? (
        <AppCard>
          <Text style={styles.errorText}>{error.message}</Text>
        </AppCard>
      ) : null}

      {isLoading ? (
        <AppCard>
          <Text style={styles.description}>Cargando credenciales...</Text>
        </AppCard>
      ) : null}

      {!isLoading && credentials.length === 0 ? <EmptyWalletState /> : null}

      {!isLoading && credentials.length > 0 ? (
        <View style={styles.list}>
          {credentials.map((credential) => (
            <CredentialCard
              key={credential.id}
              credential={credential}
              onPress={() => router.push(`/wallet/${credential.id}`)}
            />
          ))}
        </View>
      ) : null}

      <View style={styles.actions}>
        <AppButton
          title="Agregar credencial demo"
          onPress={() => void seedDemoCredential()}
        />
        <AppButton
          title="Limpiar wallet"
          onPress={() => void clearCredentials()}
          variant="secondary"
        />
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
  list: {
    gap: spacing.md,
  },
  actions: {
    gap: spacing.md,
  },
});

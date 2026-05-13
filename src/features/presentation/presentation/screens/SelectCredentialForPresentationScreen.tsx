import { useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { useWalletCredentials } from '@/src/features/wallet/application/useWalletCredentials';
import type { StoredCredential } from '@/src/features/wallet/domain/credential.types';
import { useVerifierPresentationFlow } from '../../application/useVerifierPresentationFlow';
import { CredentialSelectionCard } from '../components/CredentialSelectionCard';
import { PresentationRequestSummary } from '../components/PresentationRequestSummary';
import { AppButton } from '@/src/shared/components/AppButton';
import { AppCard } from '@/src/shared/components/AppCard';
import { Screen } from '@/src/shared/components/Screen';
import { spacing } from '@/src/shared/theme/spacing';
import { typography } from '@/src/shared/theme/typography';

export function SelectCredentialForPresentationScreen() {
  const router = useRouter();
  const {
    request,
    selectedCredentialId,
    error,
    isSubmitting,
    selectCredential,
    submitSelectedCredential,
    setError,
  } = useVerifierPresentationFlow();
  const {
    credentials,
    isLoading,
    error: walletError,
    reload,
  } = useWalletCredentials();

  const selectedCredential = useMemo(
    () =>
      credentials.find((credential) => credential.id === selectedCredentialId) ??
      null,
    [credentials, selectedCredentialId],
  );
  const isSubmitDisabled = isSubmitting || !selectedCredentialId;

  useEffect(() => {
    if (request && credentials.length === 1 && !selectedCredentialId) {
      selectCredential(credentials[0].id);
    }
  }, [credentials, request, selectCredential, selectedCredentialId]);

  const handleCredentialPress = useCallback(
    (credential: StoredCredential) => {
      selectCredential(credential.id);
    },
    [selectCredential],
  );

  const submitCredential = useCallback(
    async (credential: StoredCredential) => {
      const result = await submitSelectedCredential(credential);

      if (result) {
        router.push('/presentation/result');
      }
    },
    [router, submitSelectedCredential],
  );

  const confirmAndSubmit = useCallback(() => {
    if (!selectedCredential) {
      setError('Selecciona una credencial antes de presentar.');
      return;
    }

    if (isSubmitting) {
      return;
    }

    Alert.alert(
      'Confirmar presentación',
      'La credencial seleccionada se enviará al verificador para completar la validación.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Presentar credencial',
          onPress: () => void submitCredential(selectedCredential),
        },
      ],
    );
  }, [
    isSubmitting,
    selectedCredential,
    setError,
    submitCredential,
  ]);

  return (
    <Screen>
      <Text style={styles.title}>Seleccionar credencial</Text>

      {!request ? (
        <AppCard>
          <Text style={styles.description}>
            No hay una solicitud de presentación activa. Escanea un código QR
            del verificador para continuar.
          </Text>
          <AppButton
            title="Escanear solicitud"
            onPress={() => router.replace('/presentation/scan')}
          />
        </AppCard>
      ) : null}

      {request ? <PresentationRequestSummary request={request} /> : null}

      {walletError ? (
        <AppCard>
          <Text style={styles.errorText}>{walletError.message}</Text>
          <AppButton
            title="Reintentar"
            onPress={() => void reload()}
            variant="secondary"
          />
        </AppCard>
      ) : null}

      {isLoading ? (
        <AppCard>
          <Text style={styles.description}>Cargando credenciales...</Text>
        </AppCard>
      ) : null}

      {!isLoading && request && credentials.length === 0 ? (
        <AppCard>
          <Text style={styles.description}>
            No hay credenciales disponibles para presentar.
          </Text>
          <AppButton
            title="Ir a Wallet"
            onPress={() => router.push('/wallet')}
            variant="secondary"
          />
        </AppCard>
      ) : null}

      {!isLoading && request && credentials.length > 0 ? (
        <View style={styles.list}>
          {credentials.map((credential) => (
            <CredentialSelectionCard
              key={credential.id}
              credential={credential}
              isSelected={credential.id === selectedCredentialId}
              onPress={() => handleCredentialPress(credential)}
            />
          ))}
        </View>
      ) : null}

      {request ? (
        <View style={styles.actions}>
          <AppButton
            title={isSubmitting ? 'Enviando presentación...' : 'Presentar credencial'}
            onPress={confirmAndSubmit}
            disabled={isSubmitDisabled}
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <AppButton
            title="Escanear otro QR"
            onPress={() => router.replace('/presentation/scan')}
            variant="secondary"
          />
        </View>
      ) : null}
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

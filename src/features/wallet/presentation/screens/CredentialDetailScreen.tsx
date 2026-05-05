import { useCallback, useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import {
  getCredentialDisplaySubject,
  getCredentialPrimaryType,
  type StoredCredential,
} from '../../domain/credential.types';
import {
  getStoredCredential,
  removeStoredCredential,
} from '../../application/walletService';
import { AppButton } from '@/src/shared/components/AppButton';
import { AppCard } from '@/src/shared/components/AppCard';
import { Screen } from '@/src/shared/components/Screen';
import { spacing } from '@/src/shared/theme/spacing';
import { typography } from '@/src/shared/theme/typography';

function getRouteParam(value: string | string[] | undefined): string | null {
  if (typeof value === 'string' && value.length > 0) {
    return value;
  }

  if (Array.isArray(value) && value[0]) {
    return value[0];
  }

  return null;
}

function formatDate(value?: string): string {
  if (!value) {
    return 'No disponible';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

type SummaryRowProps = {
  label: string;
  value: string;
};

function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

export function CredentialDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ credentialId?: string | string[] }>();
  const credentialId = getRouteParam(params.credentialId);

  const [credential, setCredential] = useState<StoredCredential | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadCredential = useCallback(async () => {
    if (!credentialId) {
      setCredential(null);
      setError(new Error('No se recibio un identificador de credencial valido.'));
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const storedCredential = await getStoredCredential(credentialId);
      setCredential(storedCredential);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError
          : new Error('No fue posible cargar la credencial.'),
      );
    } finally {
      setIsLoading(false);
    }
  }, [credentialId]);

  useEffect(() => {
    void loadCredential();
  }, [loadCredential]);

  const handleDelete = useCallback(async () => {
    if (!credentialId) {
      return;
    }

    setError(null);

    try {
      await removeStoredCredential(credentialId);
      router.replace('/wallet');
    } catch (removeError) {
      setError(
        removeError instanceof Error
          ? removeError
          : new Error('No fue posible eliminar la credencial.'),
      );
    }
  }, [credentialId, router]);

  return (
    <Screen>
      <Text style={styles.title}>Detalle de credencial</Text>

      {isLoading ? (
        <AppCard>
          <Text style={styles.infoText}>Cargando credencial...</Text>
        </AppCard>
      ) : null}

      {!isLoading && error ? (
        <AppCard>
          <Text style={styles.errorText}>{error.message}</Text>
        </AppCard>
      ) : null}

      {!isLoading && !error && !credential ? (
        <AppCard>
          <Text style={styles.infoText}>La credencial solicitada no existe.</Text>
        </AppCard>
      ) : null}

      {!isLoading && !error && credential ? (
        <>
          <AppCard>
            <SummaryRow
              label="Tipo"
              value={getCredentialPrimaryType(credential)}
            />
            <SummaryRow label="Formato" value={credential.format} />
            <SummaryRow label="Issuer" value={credential.issuer} />
            <SummaryRow
              label="Subject"
              value={getCredentialDisplaySubject(credential)}
            />
            <SummaryRow
              label="Emision"
              value={formatDate(credential.issuanceDate)}
            />
            {credential.expirationDate ? (
              <SummaryRow
                label="Expiracion"
                value={formatDate(credential.expirationDate)}
              />
            ) : null}
          </AppCard>

          <AppCard>
            <Text style={styles.jsonTitle}>JSON raw</Text>
            <Text selectable style={styles.jsonBlock}>
              {JSON.stringify(credential.raw, null, 2)}
            </Text>
          </AppCard>

          <View style={styles.actions}>
            <AppButton title="Eliminar credencial" onPress={handleDelete} />
            <AppButton
              title="Volver a wallet"
              onPress={() => router.replace('/wallet')}
              variant="secondary"
            />
          </View>
        </>
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
  infoText: {
    color: '#425466',
    fontSize: typography.body,
    lineHeight: 24,
  },
  errorText: {
    color: '#8B1E1E',
    fontSize: typography.body,
    lineHeight: 24,
  },
  summaryRow: {
    gap: spacing.xs,
  },
  summaryLabel: {
    color: '#4E6A85',
    fontSize: typography.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  summaryValue: {
    color: '#243746',
    fontSize: typography.body,
    lineHeight: 24,
  },
  jsonTitle: {
    color: '#0F1720',
    fontSize: typography.heading,
    fontWeight: '600',
  },
  jsonBlock: {
    backgroundColor: '#0F1720',
    borderRadius: 12,
    color: '#EAF1F7',
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: 20,
    padding: spacing.md,
  },
  actions: {
    gap: spacing.md,
  },
});

import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/src/shared/components/AppButton';
import { AppCard } from '@/src/shared/components/AppCard';
import { maskDid } from '@/src/features/wallet/domain/holderKey.types';
import { spacing } from '@/src/shared/theme/spacing';
import { typography } from '@/src/shared/theme/typography';

type LacchainDemoIssuanceCardProps = {
  isIssuing: boolean;
  error: string | null;
  holderDid: string | null;
  storedCredentialId: string | null;
  onIssue: () => void;
  onReset: () => void;
  onViewWallet: () => void;
};

export function LacchainDemoIssuanceCard({
  isIssuing,
  error,
  holderDid,
  storedCredentialId,
  onIssue,
  onReset,
  onViewWallet,
}: LacchainDemoIssuanceCardProps) {
  return (
    <AppCard>
      <Text style={styles.title}>Emision VC demo LACChain</Text>
      <Text style={styles.description}>
        Crea un DID de holder en el issuer demo, solicita una VC para ese DID y
        la guarda en la wallet.
      </Text>
      <Text style={styles.helperText}>
        El DID y la privateKey del holder fueron guardados en SecureStore para
        esta PoC.
      </Text>
      <Text style={styles.helperText}>
        La privateKey no se muestra en pantalla.
      </Text>

      <AppButton
        title={
          isIssuing
            ? 'Emitiendo VC demo LACChain...'
            : 'Emitir VC demo LACChain'
        }
        onPress={onIssue}
        disabled={isIssuing}
      />

      {holderDid ? (
        <>
          <Text style={styles.infoText}>Holder DID: {maskDid(holderDid)}</Text>
          <Text style={styles.successText}>
            Llave del holder guardada en SecureStore.
          </Text>
        </>
      ) : null}

      {storedCredentialId ? (
        <Text style={styles.successText}>
          VC guardada correctamente en la wallet.
        </Text>
      ) : null}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.actions}>
        {storedCredentialId ? (
          <AppButton
            title="Ver en wallet"
            onPress={onViewWallet}
            variant="secondary"
          />
        ) : null}
        <AppButton
          title="Reiniciar flujo"
          onPress={onReset}
          variant="secondary"
        />
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  title: {
    color: '#0F1720',
    fontSize: typography.heading,
    fontWeight: '600',
  },
  description: {
    color: '#425466',
    fontSize: typography.body,
    lineHeight: 24,
  },
  helperText: {
    color: '#4E6A85',
    fontSize: typography.caption,
    lineHeight: 20,
  },
  infoText: {
    color: '#243746',
    fontSize: typography.body,
    lineHeight: 24,
  },
  successText: {
    color: '#15633B',
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

import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import {
  ISSUANCE_MODE,
  OID4VCI_ISSUER_BASE_URL,
} from '@/src/shared/config/env';
import { useLacchainDemoIssuanceFlow } from '../../application/useLacchainDemoIssuanceFlow';
import { useCredentialOfferDemo } from '../../application/useCredentialOfferDemo';
import { useMockIssuanceFlow } from '../../application/useMockIssuanceFlow';
import { useQrCredentialOfferScanner } from '../../application/useQrCredentialOfferScanner';
import { CredentialOfferInput } from '../components/CredentialOfferInput';
import { IssuanceFlowStatus } from '../components/IssuanceFlowStatus';
import { CredentialOfferSummary } from '../components/CredentialOfferSummary';
import { CredentialOfferQrScanner } from '../components/CredentialOfferQrScanner';
import { LacchainDemoIssuanceCard } from '../components/LacchainDemoIssuanceCard';
import { AppButton } from '@/src/shared/components/AppButton';
import { AppCard } from '@/src/shared/components/AppCard';
import { Screen } from '@/src/shared/components/Screen';
import { spacing } from '@/src/shared/theme/spacing';
import { typography } from '@/src/shared/theme/typography';

const FUTURE_STEPS = [
  'Resolver credential_offer_uri.',
  'Conectar metadata real del issuer.',
  'Conectar token endpoint real.',
  'Conectar credential endpoint real.',
  'Agregar validacion y evidencia real.',
] as const;

export function DemoIssuanceScreen() {
  const router = useRouter();
  const {
    input,
    setInput,
    parsedOffer,
    error,
    parseInput,
    applyInputAndParse,
    loadMockOffer,
    clear,
  } = useCredentialOfferDemo();
  const {
    step,
    isIssuing,
    error: issuanceError,
    storedCredentialId,
    startMockIssuance,
    resetFlow,
  } = useMockIssuanceFlow(parsedOffer);
  const {
    isIssuing: isLacchainIssuing,
    error: lacchainError,
    holderDid,
    storedCredentialId: lacchainStoredCredentialId,
    issueLacchainDemoCredential,
    resetLacchainDemoFlow,
  } = useLacchainDemoIssuanceFlow();
  const {
    isScannerOpen,
    hasScanned,
    error: scannerError,
    permissionStatus,
    openScanner,
    closeScanner,
    resetScanner,
    handleBarcodeScanned,
  } = useQrCredentialOfferScanner({
    onScanned: (value) => {
      applyInputAndParse(value);
      resetFlow();
    },
  });

  const handleClear = () => {
    clear();
    resetFlow();
    resetScanner();
  };

  return (
    <Screen>
      <Text style={styles.title}>Demo de emision</Text>

      <AppCard>
        <Text style={styles.description}>
          Procesa un credential offer de prueba antes de conectar QR y
          endpoints reales.
        </Text>
        <Text style={styles.modeText}>Modo de emision: {ISSUANCE_MODE}</Text>
        {ISSUANCE_MODE === 'real' && !OID4VCI_ISSUER_BASE_URL ? (
          <Text style={styles.warningText}>
            Modo real activo. Asegurate de que el credential_offer apunte a un
            issuer accesible y que la metadata este publicada.
          </Text>
        ) : null}
      </AppCard>

      <CredentialOfferInput value={input} onChangeText={setInput} />

      <CredentialOfferQrScanner
        isOpen={isScannerOpen}
        hasScanned={hasScanned}
        error={scannerError}
        permissionStatus={permissionStatus}
        onBarcodeScanned={handleBarcodeScanned}
        onRequestOpen={() => void openScanner()}
        onClose={closeScanner}
        onReset={resetScanner}
      />

      <View style={styles.actions}>
        <AppButton title="Usar offer de prueba" onPress={loadMockOffer} />
        <AppButton
          title="Procesar offer"
          onPress={parseInput}
          variant="secondary"
        />
        <AppButton title="Limpiar" onPress={handleClear} variant="secondary" />
      </View>

      {error || issuanceError ? (
        <AppCard>
          <Text style={styles.errorText}>
            {error?.message ?? issuanceError}
          </Text>
        </AppCard>
      ) : null}

      {parsedOffer ? (
        <CredentialOfferSummary parsedOffer={parsedOffer} />
      ) : null}

      <View style={styles.actions}>
        <AppButton
          title="Reclamar credencial"
          onPress={() => void startMockIssuance()}
          disabled={!parsedOffer || isIssuing}
        />
        {storedCredentialId ? (
          <AppButton
            title="Ver en wallet"
            onPress={() => router.push('/wallet')}
            variant="secondary"
          />
        ) : null}
      </View>

      <IssuanceFlowStatus
        step={step}
        isIssuing={isIssuing}
        error={issuanceError}
        storedCredentialId={storedCredentialId}
      />

      <LacchainDemoIssuanceCard
        isIssuing={isLacchainIssuing}
        error={lacchainError}
        holderDid={holderDid}
        storedCredentialId={lacchainStoredCredentialId}
        onIssue={() => void issueLacchainDemoCredential()}
        onReset={resetLacchainDemoFlow}
        onViewWallet={() => router.push('/wallet')}
      />

      <AppCard>
        <Text style={styles.sectionTitle}>Proximos pasos</Text>
        <View style={styles.list}>
          {FUTURE_STEPS.map((step) => (
            <View key={step} style={styles.listItem}>
              <Text style={styles.bullet}>-</Text>
              <Text style={styles.listText}>{step}</Text>
            </View>
          ))}
        </View>
      </AppCard>

      <AppButton
        title="Volver al inicio"
        onPress={() => router.replace('/')}
        variant="secondary"
      />
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
  modeText: {
    color: '#12344D',
    fontSize: typography.body,
    fontWeight: '600',
  },
  warningText: {
    color: '#7A5412',
    fontSize: typography.body,
    lineHeight: 24,
  },
  sectionTitle: {
    color: '#0F1720',
    fontSize: typography.heading,
    fontWeight: '600',
  },
  actions: {
    gap: spacing.md,
  },
  errorText: {
    color: '#8B1E1E',
    fontSize: typography.body,
    lineHeight: 24,
  },
  list: {
    gap: spacing.sm,
  },
  listItem: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  bullet: {
    color: '#12344D',
    fontSize: typography.body,
    fontWeight: '700',
    marginTop: 1,
  },
  listText: {
    color: '#425466',
    flex: 1,
    fontSize: typography.body,
    lineHeight: 24,
  },
});

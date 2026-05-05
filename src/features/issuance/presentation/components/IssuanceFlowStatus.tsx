import { StyleSheet, Text, View } from 'react-native';

import type { IssuanceFlowStep } from '../../domain/issuanceFlow.types';
import { AppCard } from '@/src/shared/components/AppCard';
import { spacing } from '@/src/shared/theme/spacing';
import { typography } from '@/src/shared/theme/typography';

type IssuanceFlowStatusProps = {
  step: IssuanceFlowStep;
  isIssuing: boolean;
  error: string | null;
  storedCredentialId: string | null;
};

const STEP_ORDER: IssuanceFlowStep[] = [
  'offer_parsed',
  'metadata_loaded',
  'token_received',
  'credential_received',
  'stored',
];

const STEP_LABELS: {
  label: string;
  step: IssuanceFlowStep;
}[] = [
  { label: 'Offer parseado', step: 'offer_parsed' },
  { label: 'Metadata cargada', step: 'metadata_loaded' },
  { label: 'Token recibido', step: 'token_received' },
  { label: 'Credencial recibida', step: 'credential_received' },
  { label: 'Credencial guardada', step: 'stored' },
];

function isStepCompleted(
  currentStep: IssuanceFlowStep,
  targetStep: IssuanceFlowStep,
): boolean {
  if (currentStep === 'idle' || currentStep === 'error') {
    return false;
  }

  return STEP_ORDER.indexOf(currentStep) >= STEP_ORDER.indexOf(targetStep);
}

export function IssuanceFlowStatus({
  step,
  isIssuing,
  error,
  storedCredentialId,
}: IssuanceFlowStatusProps) {
  return (
    <AppCard>
      <Text style={styles.title}>Estado del flujo mock</Text>

      <View style={styles.list}>
        {STEP_LABELS.map((item) => (
          <Text key={item.step} style={styles.listItem}>
            {isStepCompleted(step, item.step) ? '[x]' : '[ ]'} {item.label}
          </Text>
        ))}
      </View>

      {isIssuing ? (
        <Text style={styles.infoText}>Ejecutando flujo mock OID4VCI...</Text>
      ) : null}

      {storedCredentialId ? (
        <Text style={styles.infoText}>
          Credencial guardada con id: {storedCredentialId}
        </Text>
      ) : null}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  title: {
    color: '#0F1720',
    fontSize: typography.heading,
    fontWeight: '600',
  },
  list: {
    gap: spacing.xs,
  },
  listItem: {
    color: '#243746',
    fontSize: typography.body,
    lineHeight: 24,
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
});

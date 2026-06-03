import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import {
  clearTraceabilityEventDraft,
  getTraceabilityEventDraft,
} from '../../application/traceabilityDraftStore';
import { TraceabilitySummaryCard } from '../components/TraceabilitySummaryCard';
import { AppButton } from '@/src/shared/components/AppButton';
import { AppCard } from '@/src/shared/components/AppCard';
import { Screen } from '@/src/shared/components/Screen';
import { colors } from '@/src/shared/theme/colors';
import { spacing } from '@/src/shared/theme/spacing';
import { typography } from '@/src/shared/theme/typography';

const TRACEABILITY_ROUTE = '/traceability' as Href;

type SummaryRowProps = {
  label: string;
  value?: string;
};

function formatDate(value?: string): string {
  if (!value) {
    return new Date().toLocaleString();
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return new Date().toLocaleString();
  }

  return date.toLocaleString();
}

function SummaryRow({ label, value }: SummaryRowProps) {
  if (!value) {
    return null;
  }

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export function TraceabilityConfirmationScreen() {
  const router = useRouter();
  const event = getTraceabilityEventDraft();
  const evidence = event?.signatureEvidence;
  const certificate = evidence?.certificate;
  const lotCode = event?.lotCode ?? 'CAF-001';
  const date = formatDate(event?.createdAt);

  const goHome = () => {
    clearTraceabilityEventDraft();
    router.replace('/home');
  };

  const registerAnother = () => {
    clearTraceabilityEventDraft();
    router.replace(TRACEABILITY_ROUTE);
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Registro confirmado</Text>
        <Text style={styles.description}>
          La evidencia fue registrada correctamente.
        </Text>
      </View>

      <TraceabilitySummaryCard
        lotCode={lotCode}
        date={date}
        status={
          evidence?.validationStatus === 'POC_VALID'
            ? 'Validación PoC correcta'
            : 'Registro firmado'
        }
      />

      {evidence ? (
        <AppCard>
          <View style={styles.summaryGroup}>
            <SummaryRow label="Tipo de evento" value={event?.eventType} />
            <SummaryRow label="Document hash" value={evidence.documentHash} />
            <SummaryRow label="Modo de firma" value={evidence.mode} />
            <SummaryRow
              label="Estado de validación"
              value={evidence.validationStatus}
            />
            <SummaryRow
              label="Signature hash"
              value={evidence.signatureHash}
            />
            <SummaryRow label="TxHash" value={evidence.blockchainTxHash} />
          </View>
        </AppCard>
      ) : null}

      {certificate ? (
        <AppCard>
          <View style={styles.summaryGroup}>
            <Text style={styles.sectionTitle}>Certificado</Text>
            <SummaryRow label="Titular" value={certificate.subjectName} />
            <SummaryRow
              label="Documento"
              value={certificate.subjectDocument}
            />
            <SummaryRow label="Emisor" value={certificate.issuer} />
            <SummaryRow label="Serial" value={certificate.serialNumber} />
            <SummaryRow label="Fingerprint" value={certificate.fingerprint} />
          </View>
        </AppCard>
      ) : null}


      {!event ? (
        <AppCard>
          <Text style={styles.description}>
            No encontramos un registro reciente para mostrar.
          </Text>
        </AppCard>
      ) : null}

      <View style={styles.actions}>
        <AppButton title="Volver al inicio" onPress={goHome} />
        <AppButton
          title="Registrar otro"
          onPress={registerAnother}
          variant="secondary"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: '700',
  },
  description: {
    color: colors.textMuted,
    fontSize: typography.body,
    lineHeight: 24,
  },
  actions: {
    gap: spacing.md,
  },
  summaryGroup: {
    gap: spacing.md,
  },
  row: {
    gap: spacing.xs,
  },
  label: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: '700',
  },
  value: {
    color: colors.text,
    fontSize: typography.body,
    lineHeight: 24,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.heading,
    fontWeight: '700',
  },
  note: {
    color: colors.warning,
    fontSize: typography.body,
    fontWeight: '700',
    lineHeight: 24,
  },
});

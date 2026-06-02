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

export function TraceabilityConfirmationScreen() {
  const router = useRouter();
  const event = getTraceabilityEventDraft();
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
        status="Registro firmado"
      />

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
});

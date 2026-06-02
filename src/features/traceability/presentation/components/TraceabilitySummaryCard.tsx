import { StyleSheet, Text, View } from 'react-native';

import { AppCard } from '@/src/shared/components/AppCard';
import { colors } from '@/src/shared/theme/colors';
import { spacing } from '@/src/shared/theme/spacing';
import { typography } from '@/src/shared/theme/typography';

type SummaryRowProps = {
  label: string;
  value: string;
};

function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

type TraceabilitySummaryCardProps = {
  lotCode: string;
  date: string;
  status: string;
};

export function TraceabilitySummaryCard({
  lotCode,
  date,
  status,
}: TraceabilitySummaryCardProps) {
  return (
    <AppCard>
      <SummaryRow label="Código de lote" value={lotCode} />
      <SummaryRow label="Fecha" value={date} />
      <SummaryRow label="Estado" value={status} />
    </AppCard>
  );
}

const styles = StyleSheet.create({
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
});

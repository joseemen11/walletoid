import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors } from '@/src/shared/theme/colors';
import { spacing } from '@/src/shared/theme/spacing';

type AppCardProps = {
  children: ReactNode;
};

export function AppCard({ children }: AppCardProps) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
});

import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '@/src/shared/theme/spacing';

type AppCardProps = {
  children: ReactNode;
};

export function AppCard({ children }: AppCardProps) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D7E0EA',
    borderRadius: 16,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
});

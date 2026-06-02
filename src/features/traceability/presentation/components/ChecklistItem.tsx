import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/src/shared/theme/colors';
import { spacing } from '@/src/shared/theme/spacing';
import { typography } from '@/src/shared/theme/typography';

type ChecklistItemProps = {
  label: string;
  complete: boolean;
};

export function ChecklistItem({ label, complete }: ChecklistItemProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.dot, complete && styles.completeDot]} />
      <Text style={[styles.label, complete && styles.completeLabel]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dot: {
    backgroundColor: colors.disabled,
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  completeDot: {
    backgroundColor: colors.success,
  },
  label: {
    color: colors.textMuted,
    fontSize: typography.body,
    lineHeight: 24,
  },
  completeLabel: {
    color: colors.text,
    fontWeight: '600',
  },
});

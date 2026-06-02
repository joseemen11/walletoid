import { StyleSheet, Text, View } from 'react-native';

import { AppCard } from '@/src/shared/components/AppCard';
import { colors } from '@/src/shared/theme/colors';
import { spacing } from '@/src/shared/theme/spacing';
import { typography } from '@/src/shared/theme/typography';

type EvidenceStatusCardProps = {
  title: string;
  status: string;
  description?: string;
  isReady: boolean;
};

export function EvidenceStatusCard({
  title,
  status,
  description,
  isReady,
}: EvidenceStatusCardProps) {
  return (
    <AppCard>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={[styles.badge, isReady && styles.readyBadge]}>
          <Text style={[styles.badgeText, isReady && styles.readyBadgeText]}>
            {status}
          </Text>
        </View>
      </View>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: typography.heading,
    fontWeight: '700',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.warningLight,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  readyBadge: {
    backgroundColor: colors.successLight,
  },
  badgeText: {
    color: colors.warning,
    fontSize: typography.caption,
    fontWeight: '700',
  },
  readyBadgeText: {
    color: colors.success,
  },
  description: {
    color: colors.textMuted,
    fontSize: typography.body,
    lineHeight: 24,
  },
});

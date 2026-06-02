import { StyleSheet, Text, View } from 'react-native';

import type { TraceabilityLocation } from '../../domain/traceability.types';
import { colors } from '@/src/shared/theme/colors';
import { spacing } from '@/src/shared/theme/spacing';
import { typography } from '@/src/shared/theme/typography';

type LocationPreviewCardProps = {
  location: TraceabilityLocation;
};

export function LocationPreviewCard({ location }: LocationPreviewCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Ubicación capturada</Text>
      </View>
      <Text style={styles.coordinates}>
        {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.successLight,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    color: colors.success,
    fontSize: typography.caption,
    fontWeight: '700',
  },
  coordinates: {
    color: colors.textMuted,
    fontSize: typography.body,
    lineHeight: 24,
  },
});

import { Image, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/src/shared/theme/colors';
import { spacing } from '@/src/shared/theme/spacing';
import { typography } from '@/src/shared/theme/typography';

type PhotoPreviewCardProps = {
  photoUri: string;
};

export function PhotoPreviewCard({ photoUri }: PhotoPreviewCardProps) {
  return (
    <View style={styles.container}>
      <Image source={{ uri: photoUri }} style={styles.image} />
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Foto adjunta</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  image: {
    aspectRatio: 4 / 3,
    backgroundColor: colors.primaryLight,
    borderRadius: 16,
    width: '100%',
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
});

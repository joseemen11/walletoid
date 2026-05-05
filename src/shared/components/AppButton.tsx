import { Pressable, StyleSheet, Text } from 'react-native';

import { spacing } from '@/src/shared/theme/spacing';
import { typography } from '@/src/shared/theme/typography';

export type AppButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
};

export function AppButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
}: AppButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' ? styles.primary : styles.secondary,
        disabled ? styles.disabled : pressed && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.label,
          variant === 'primary' ? styles.primaryLabel : styles.secondaryLabel,
          disabled && styles.disabledLabel,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: 12,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  primary: {
    backgroundColor: '#12344D',
  },
  secondary: {
    backgroundColor: '#FFFFFF',
    borderColor: '#12344D',
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.88,
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    fontSize: typography.body,
    fontWeight: '600',
  },
  primaryLabel: {
    color: '#FFFFFF',
  },
  secondaryLabel: {
    color: '#12344D',
  },
  disabledLabel: {
    color: '#425466',
  },
});

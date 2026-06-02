import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/src/shared/theme/colors';
import { spacing } from '@/src/shared/theme/spacing';
import { typography } from '@/src/shared/theme/typography';
import { AppButton, type AppButtonProps } from './AppButton';

type ConfirmModalProps = {
  visible: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  supportingText?: string;
  confirmVariant?: AppButtonProps['variant'];
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  visible,
  title,
  description,
  confirmLabel,
  cancelLabel,
  supportingText,
  confirmVariant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={loading ? undefined : onCancel}
    >
      <Pressable style={styles.overlay} onPress={loading ? undefined : onCancel}>
        <Pressable style={styles.card}>
          <View style={styles.textGroup}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
            {supportingText ? (
              <Text style={styles.supportingText}>{supportingText}</Text>
            ) : null}
          </View>
          <View style={styles.actions}>
            <AppButton
              title={cancelLabel}
              onPress={onCancel}
              variant="secondary"
              disabled={loading}
            />
            <AppButton
              title={confirmLabel}
              onPress={onConfirm}
              variant={confirmVariant}
              loading={loading}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    backgroundColor: colors.overlay,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    gap: spacing.lg,
    maxWidth: 420,
    padding: spacing.lg,
    width: '100%',
  },
  textGroup: {
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: typography.heading,
    fontWeight: '700',
  },
  description: {
    color: colors.textMuted,
    fontSize: typography.body,
    lineHeight: 24,
  },
  supportingText: {
    color: colors.primary,
    fontSize: typography.caption,
    fontWeight: '700',
    lineHeight: 18,
  },
  actions: {
    gap: spacing.md,
  },
});

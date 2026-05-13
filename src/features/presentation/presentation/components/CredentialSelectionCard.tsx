import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  getCredentialDisplaySubject,
  getCredentialPrimaryType,
  type StoredCredential,
} from '@/src/features/wallet/domain/credential.types';
import { AppCard } from '@/src/shared/components/AppCard';
import { spacing } from '@/src/shared/theme/spacing';
import { typography } from '@/src/shared/theme/typography';

type CredentialSelectionCardProps = {
  credential: StoredCredential;
  isSelected: boolean;
  onPress: () => void;
};

function formatDate(value?: string): string {
  if (!value) {
    return 'No disponible';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

type DetailRowProps = {
  label: string;
  value: string;
};

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export function CredentialSelectionCard({
  credential,
  isSelected,
  onPress,
}: CredentialSelectionCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      onPress={onPress}
      style={({ pressed }) => [
        pressed && styles.pressed,
        isSelected && styles.selectedWrapper,
      ]}
    >
      <AppCard>
        <View style={styles.header}>
          <Text style={styles.title}>{getCredentialPrimaryType(credential)}</Text>
          <Text style={[styles.badge, isSelected && styles.selectedBadge]}>
            {isSelected ? 'Seleccionada' : 'Disponible'}
          </Text>
        </View>
        <DetailRow label="Emisor" value={credential.issuer} />
        <DetailRow
          label="Titular"
          value={getCredentialDisplaySubject(credential)}
        />
        <DetailRow label="Emision" value={formatDate(credential.issuanceDate)} />
        <DetailRow
          label="Expiracion"
          value={formatDate(credential.expirationDate)}
        />
      </AppCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.92,
  },
  selectedWrapper: {
    borderColor: '#12344D',
    borderRadius: 18,
    borderWidth: 2,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  title: {
    color: '#0F1720',
    flex: 1,
    fontSize: typography.heading,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: '#EAF1F7',
    borderRadius: 999,
    color: '#425466',
    fontSize: typography.caption,
    fontWeight: '700',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  selectedBadge: {
    backgroundColor: '#D8F3DC',
    color: '#1D6F42',
  },
  row: {
    gap: spacing.xs,
  },
  rowLabel: {
    color: '#4E6A85',
    fontSize: typography.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  rowValue: {
    color: '#243746',
    fontSize: typography.body,
    lineHeight: 22,
  },
});

import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  getCredentialDisplaySubject,
  getCredentialPrimaryType,
  type StoredCredential,
} from '../../domain/credential.types';
import { AppCard } from '@/src/shared/components/AppCard';
import { spacing } from '@/src/shared/theme/spacing';
import { typography } from '@/src/shared/theme/typography';

type CredentialCardProps = {
  credential: StoredCredential;
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

export function CredentialCard({
  credential,
  onPress,
}: CredentialCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <AppCard>
        <Text style={styles.title}>{getCredentialPrimaryType(credential)}</Text>
        <DetailRow label="Issuer" value={credential.issuer} />
        <DetailRow
          label="Subject"
          value={getCredentialDisplaySubject(credential)}
        />
        <DetailRow
          label="Emision"
          value={formatDate(credential.issuanceDate)}
        />
        <DetailRow label="Formato" value={credential.format} />
      </AppCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.92,
  },
  title: {
    color: '#0F1720',
    fontSize: typography.heading,
    fontWeight: '600',
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

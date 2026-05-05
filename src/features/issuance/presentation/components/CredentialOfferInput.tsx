import { StyleSheet, Text, TextInput, View } from 'react-native';

import { spacing } from '@/src/shared/theme/spacing';
import { typography } from '@/src/shared/theme/typography';

type CredentialOfferInputProps = {
  value: string;
  onChangeText: (value: string) => void;
};

export function CredentialOfferInput({
  value,
  onChangeText,
}: CredentialOfferInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Credential offer</Text>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        multiline
        onChangeText={onChangeText}
        placeholder="Pega aqui un JSON o una URI con credential_offer / credential_offer_uri"
        placeholderTextColor="#6B7C8F"
        style={styles.input}
        textAlignVertical="top"
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  label: {
    color: '#0F1720',
    fontSize: typography.heading,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D7E0EA',
    borderRadius: 16,
    borderWidth: 1,
    color: '#0F1720',
    fontSize: typography.body,
    minHeight: 220,
    padding: spacing.md,
  },
});

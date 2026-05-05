import { StyleSheet, Text, View } from 'react-native';

import { spacing } from '@/src/shared/theme/spacing';
import { typography } from '@/src/shared/theme/typography';

export function EmptyWalletState() {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>[ ]</Text>
      <Text style={styles.title}>Wallet vacia</Text>
      <Text style={styles.description}>
        Aun no hay credenciales guardadas. Agrega una demo para validar la
        persistencia local de esta PoC.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#EAF1F7',
    borderRadius: 16,
    gap: spacing.sm,
    padding: spacing.xl,
  },
  icon: {
    color: '#12344D',
    fontSize: 32,
    fontWeight: '700',
  },
  title: {
    color: '#0F1720',
    fontSize: typography.heading,
    fontWeight: '600',
  },
  description: {
    color: '#425466',
    fontSize: typography.body,
    lineHeight: 24,
    textAlign: 'center',
  },
});

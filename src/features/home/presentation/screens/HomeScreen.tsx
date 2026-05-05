import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/src/shared/components/AppButton';
import { AppCard } from '@/src/shared/components/AppCard';
import { Screen } from '@/src/shared/components/Screen';
import {
  APP_DESCRIPTION,
  APP_NAME,
} from '@/src/shared/constants/app';
import { spacing } from '@/src/shared/theme/spacing';
import { typography } from '@/src/shared/theme/typography';

export function HomeScreen() {
  const router = useRouter();

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Wallet PoC</Text>
        <Text style={styles.title}>{APP_NAME}</Text>
        <Text style={styles.description}>{APP_DESCRIPTION}</Text>
      </View>

      <AppCard>
        <Text style={styles.cardTitle}>Base inicial lista para extender</Text>
        <Text style={styles.cardText}>
          Navegacion simple, estructura por features y componentes compartidos
          para avanzar con OID4VCI en etapas posteriores.
        </Text>
      </AppCard>

      <View style={styles.actions}>
        <AppButton title="Ver wallet" onPress={() => router.push('/wallet')} />
        <AppButton
          title="Ir a demo de emision"
          onPress={() => router.push('/demo')}
          variant="secondary"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: spacing.md,
  },
  eyebrow: {
    color: '#4E6A85',
    fontSize: typography.caption,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    color: '#0F1720',
    fontSize: typography.title,
    fontWeight: '700',
  },
  description: {
    color: '#425466',
    fontSize: typography.body,
    lineHeight: 24,
  },
  cardTitle: {
    color: '#0F1720',
    fontSize: typography.heading,
    fontWeight: '600',
  },
  cardText: {
    color: '#425466',
    fontSize: typography.body,
    lineHeight: 24,
  },
  actions: {
    gap: spacing.md,
  },
});

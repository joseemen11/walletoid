import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useCiudadaniaLogin } from '../../useCiudadaniaLogin';
import { AppButton } from '@/src/shared/components/AppButton';
import { AppCard } from '@/src/shared/components/AppCard';
import { Screen } from '@/src/shared/components/Screen';
import { colors } from '@/src/shared/theme/colors';
import { spacing } from '@/src/shared/theme/spacing';
import { typography } from '@/src/shared/theme/typography';

export function LoginScreen() {
  const router = useRouter();
  const { error, loading, login, user } = useCiudadaniaLogin();

  useEffect(() => {
    if (user) {
      router.replace('/identity/check');
    }
  }, [router, user]);

  return (
    <Screen>
      <View style={styles.hero}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Ciudadanía Digital</Text>
        </View>
        <Text style={styles.title}>Inicia sesión con Ciudadanía Digital</Text>
        <Text style={styles.description}>
          Usaremos tu identidad para preparar el registro de trazabilidad.
        </Text>
      </View>

      <AppCard>
        <AppButton
          disabled={loading}
          onPress={() => void login()}
          title={loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
        />
        {error ? (
          <Text style={styles.errorText}>
            No pudimos iniciar sesión. Intenta nuevamente.
          </Text>
        ) : null}
      </AppCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    flex: 1,
    gap: spacing.md,
    justifyContent: 'center',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    color: colors.primaryDark,
    fontSize: typography.caption,
    fontWeight: '700',
  },
  title: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: '700',
  },
  description: {
    color: colors.textMuted,
    fontSize: typography.body,
    lineHeight: 24,
  },
  errorText: {
    color: colors.danger,
    fontSize: typography.body,
    lineHeight: 24,
  },
});

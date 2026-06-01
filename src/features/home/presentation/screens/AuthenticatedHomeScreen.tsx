import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  clearCiudadaniaSession,
  loadCiudadaniaSession,
} from '@/src/features/auth/ciudadania/ciudadaniaSessionStorage';
import {
  mapCiudadaniaUserForDisplay,
  type CiudadaniaDisplayUser,
} from '@/src/features/auth/ciudadania/ciudadaniaAuthService';
import { AppButton } from '@/src/shared/components/AppButton';
import { AppCard } from '@/src/shared/components/AppCard';
import { ConfirmModal } from '@/src/shared/components/ConfirmModal';
import { LoadingState } from '@/src/shared/components/LoadingState';
import { Screen } from '@/src/shared/components/Screen';
import { colors } from '@/src/shared/theme/colors';
import { spacing } from '@/src/shared/theme/spacing';
import { typography } from '@/src/shared/theme/typography';

export function AuthenticatedHomeScreen() {
  const router = useRouter();
  const [user, setUser] = useState<CiudadaniaDisplayUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [traceabilityMessage, setTraceabilityMessage] = useState<string | null>(
    null,
  );
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      try {
        const session = await loadCiudadaniaSession();

        if (!mounted) {
          return;
        }

        if (!session) {
          router.replace('/auth/login');
          return;
        }

        setUser(mapCiudadaniaUserForDisplay(session.user));
      } catch {
        if (mounted) {
          router.replace('/auth/login');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void loadSession();

    return () => {
      mounted = false;
    };
  }, [router]);

  const logout = useCallback(async () => {
    await clearCiudadaniaSession();
    setIsLogoutModalVisible(false);
    setUser(null);
    router.replace('/auth/login');
  }, [router]);

  if (isLoading) {
    return (
      <Screen>
        <LoadingState
          title="Revisando tu sesión"
          description="Un momento, estamos preparando tu acceso."
        />
      </Screen>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.title}>Hola, {user.fullName}</Text>
      </View>

      <AppCard>
        <Text style={styles.cardTitle}>Trazabilidad</Text>
        <Text style={styles.cardText}>
          Registra una ubicación y una foto como evidencia.
        </Text>
        <AppButton
          title="Registrar trazabilidad"
          onPress={() => {
            setTraceabilityMessage(
              'Esta sección se implementará en la siguiente fase.',
            );
          }}
        />
      </AppCard>

      <View style={styles.actions}>
        <AppButton
          title="Cerrar sesión"
          onPress={() => setIsLogoutModalVisible(true)}
          variant="secondary"
        />
      </View>

      {traceabilityMessage ? (
        <AppCard>
          <Text style={styles.cardText}>{traceabilityMessage}</Text>
        </AppCard>
      ) : null}

      <ConfirmModal
        visible={isLogoutModalVisible}
        title="¿Deseas cerrar sesión?"
        description="Podrás volver a ingresar con Ciudadanía Digital."
        cancelLabel="Cancelar"
        confirmLabel="Cerrar sesión"
        onCancel={() => setIsLogoutModalVisible(false)}
        onConfirm={() => void logout()}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: '700',
  },
  cardTitle: {
    color: colors.text,
    fontSize: typography.heading,
    fontWeight: '600',
  },
  cardText: {
    color: colors.textMuted,
    fontSize: typography.body,
    lineHeight: 24,
  },
  actions: {
    gap: spacing.md,
  },
});

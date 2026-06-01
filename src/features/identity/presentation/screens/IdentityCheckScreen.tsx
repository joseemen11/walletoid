import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { loadCiudadaniaSession } from '@/src/features/auth/ciudadania/ciudadaniaSessionStorage';
import {
  clearPreparedIdentityCredentialDemo,
  hasPreparedIdentityCredentialDemo,
  savePreparedIdentityCredentialDemo,
} from '@/src/features/identity/application/identityCredentialDemoStorage';
import { AppButton } from '@/src/shared/components/AppButton';
import { AppCard } from '@/src/shared/components/AppCard';
import { ErrorState } from '@/src/shared/components/ErrorState';
import { LoadingState } from '@/src/shared/components/LoadingState';
import { Screen } from '@/src/shared/components/Screen';
import { colors } from '@/src/shared/theme/colors';
import { spacing } from '@/src/shared/theme/spacing';
import { typography } from '@/src/shared/theme/typography';

type IdentityCheckStep =
  | 'validating'
  | 'validated'
  | 'preparing'
  | 'ready'
  | 'readyExisting'
  | 'error';

const STEP_COPY: Record<IdentityCheckStep, string> = {
  validating: 'Estamos validando tu identidad',
  validated: 'Tu identidad fue validada',
  preparing: 'Preparando tu credencial',
  ready: 'Tu credencial está lista',
  readyExisting: 'Tu credencial ya está lista',
  error: 'No pudimos preparar tu credencial. Intenta nuevamente.',
};

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function IdentityCheckScreen() {
  const router = useRouter();
  const [step, setStep] = useState<IdentityCheckStep>('validating');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function validateIdentity() {
      try {
        const session = await loadCiudadaniaSession();

        if (!session) {
          router.replace('/auth/login');
          return;
        }

        await wait(700);

        if (!mounted) {
          return;
        }

        const isPrepared = await hasPreparedIdentityCredentialDemo();

        setStep(isPrepared ? 'readyExisting' : 'validated');
      } catch {
        if (mounted) {
          setStep('error');
        }
      }
    }

    void validateIdentity();

    return () => {
      mounted = false;
    };
  }, [attempt, router]);

  const prepareCredential = async () => {
    setStep('preparing');

    try {
      // TODO POC: aquí reclamar la credencial de identidad después del login.
      // TODO POC: aquí guardar la credencial de identidad real.
      // TODO POC: reemplazar este mock por el flujo real de credencial.
      await wait(1100);
      await savePreparedIdentityCredentialDemo();
      setStep('ready');
    } catch {
      setStep('error');
    }
  };

  const prepareAgain = async () => {
    await clearPreparedIdentityCredentialDemo();
    setStep('validated');
  };

  if (step === 'error') {
    return (
      <Screen>
        <AppCard>
          <ErrorState
            title={STEP_COPY.error}
            description="Intenta nuevamente."
            actionLabel="Reintentar"
            onAction={() => {
              setStep('validating');
              setAttempt((currentAttempt) => currentAttempt + 1);
            }}
          />
        </AppCard>
      </Screen>
    );
  }

  if (step === 'validating' || step === 'preparing') {
    return (
      <Screen>
        <LoadingState
          title={STEP_COPY[step]}
          description="Un momento, estamos preparando tu acceso."
        />
      </Screen>
    );
  }

  const isReady = step === 'ready' || step === 'readyExisting';

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{STEP_COPY.validated}</Text>
        </View>
        <Text style={styles.title}>{STEP_COPY.validated}</Text>
      </View>

      <AppCard>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Credencial de identidad</Text>
          <View style={[styles.statusBadge, isReady && styles.readyBadge]}>
            <Text style={[styles.statusText, isReady && styles.readyStatusText]}>
              {isReady ? STEP_COPY[step] : 'Pendiente de preparación'}
            </Text>
          </View>
        </View>

        <Text style={styles.cardText}>
          {isReady ? STEP_COPY[step] : 'Prepara tu credencial.'}
        </Text>
      </AppCard>

      <View style={styles.actions}>
        {isReady ? (
          <>
            <AppButton title="Continuar" onPress={() => router.replace('/home')} />
            {step === 'readyExisting' ? (
              <AppButton
                title="Preparar nuevamente"
                onPress={() => void prepareAgain()}
                variant="secondary"
              />
            ) : null}
          </>
        ) : (
          <AppButton
            title="Preparar credencial"
            onPress={() => void prepareCredential()}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.md,
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
  cardHeader: {
    gap: spacing.sm,
  },
  cardTitle: {
    color: colors.text,
    fontSize: typography.heading,
    fontWeight: '700',
  },
  cardText: {
    color: colors.textMuted,
    fontSize: typography.body,
    lineHeight: 24,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.warningLight,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  readyBadge: {
    backgroundColor: colors.successLight,
  },
  statusText: {
    color: colors.warning,
    fontSize: typography.caption,
    fontWeight: '700',
  },
  readyStatusText: {
    color: colors.success,
  },
  actions: {
    gap: spacing.md,
  },
});

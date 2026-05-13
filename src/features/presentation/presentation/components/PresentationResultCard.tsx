import { StyleSheet, Text, View } from 'react-native';

import type { VerifierPresentationResponse } from '../../domain/verifierPresentation.types';
import { AppCard } from '@/src/shared/components/AppCard';
import { spacing } from '@/src/shared/theme/spacing';
import { typography } from '@/src/shared/theme/typography';

type PresentationResultCardProps = {
  result: VerifierPresentationResponse;
};

const MAIN_CHECKS = [
  'structureValid',
  'issuerExtracted',
  'issuerAddressValid',
  'credentialExists',
  'isNotRevoked',
  'issuerSignatureValid',
  'claimsVerifierNotExpired',
  'issuerTrusted',
] as const;

const CHECK_LABELS: Record<(typeof MAIN_CHECKS)[number], string> = {
  structureValid: 'Estructura de credencial válida',
  issuerExtracted: 'Issuer identificado',
  issuerAddressValid: 'Dirección del issuer válida',
  credentialExists: 'Credencial registrada',
  isNotRevoked: 'Credencial no revocada',
  issuerSignatureValid: 'Firma del issuer válida',
  claimsVerifierNotExpired: 'Registro contractual vigente',
  issuerTrusted: 'Issuer confiable',
};

const STATUS_LABELS: Record<VerifierPresentationResponse['status'], string> = {
  verified: 'Verificación completada',
  failed: 'Verificación fallida',
  expired: 'Solicitud expirada',
};

function formatBoolean(value: boolean | undefined): string {
  if (value === true) {
    return 'Aprobado';
  }

  if (value === false) {
    return 'Revisar';
  }

  return 'No disponible';
}

function getResultTitle(result: VerifierPresentationResponse): string {
  if (result.verificationResult?.valid === true) {
    return 'Credencial verificada correctamente';
  }

  if (result.verificationResult?.valid === false) {
    return 'La credencial no superó la verificación';
  }

  if (result.status === 'expired') {
    return 'La solicitud expiró';
  }

  return 'Resultado recibido';
}

function getResultDescription(result: VerifierPresentationResponse): string {
  if (result.verificationResult?.valid === true) {
    return 'La presentación fue enviada y validada por el verificador.';
  }

  if (result.verificationResult?.valid === false) {
    return 'Revisa los detalles de validación o intenta con otra credencial.';
  }

  return result.error ?? 'No fue posible completar la verificación.';
}

export function PresentationResultCard({ result }: PresentationResultCardProps) {
  const checks = result.verificationResult?.checks ?? {};

  return (
    <AppCard>
      <Text style={styles.title}>{getResultTitle(result)}</Text>
      <Text style={styles.description}>{getResultDescription(result)}</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Estado</Text>
        <Text style={styles.value}>{STATUS_LABELS[result.status]}</Text>
      </View>
      <View style={styles.checkList}>
        {MAIN_CHECKS.map((check) => (
          <View key={check} style={styles.checkRow}>
            <Text style={styles.checkName}>{CHECK_LABELS[check]}</Text>
            <Text style={styles.checkValue}>{formatBoolean(checks[check])}</Text>
          </View>
        ))}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  title: {
    color: '#0F1720',
    fontSize: typography.heading,
    fontWeight: '600',
  },
  row: {
    gap: spacing.xs,
  },
  description: {
    color: '#425466',
    fontSize: typography.body,
    lineHeight: 24,
  },
  label: {
    color: '#4E6A85',
    fontSize: typography.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  value: {
    color: '#243746',
    fontSize: typography.body,
    lineHeight: 22,
  },
  checkList: {
    gap: spacing.sm,
  },
  checkRow: {
    alignItems: 'center',
    borderColor: '#D7E0EA',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  checkName: {
    color: '#243746',
    flex: 1,
    fontSize: typography.body,
  },
  checkValue: {
    color: '#12344D',
    fontSize: typography.body,
    fontWeight: '700',
  },
});

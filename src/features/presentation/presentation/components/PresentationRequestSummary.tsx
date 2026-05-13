import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { VerifierPresentationQrPayload } from '../../domain/verifierPresentation.types';
import { AppCard } from '@/src/shared/components/AppCard';
import { spacing } from '@/src/shared/theme/spacing';
import { typography } from '@/src/shared/theme/typography';

type PresentationRequestSummaryProps = {
  request: VerifierPresentationQrPayload;
};

function shortenMiddle(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  const edgeLength = Math.max(8, Math.floor((maxLength - 3) / 2));
  return `${value.slice(0, edgeLength)}...${value.slice(-edgeLength)}`;
}

function isLocalhostUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  } catch {
    return value.includes('localhost') || value.includes('127.0.0.1');
  }
}

type SummaryRowProps = {
  label: string;
  value: string;
};

function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text selectable style={styles.value}>
        {value}
      </Text>
    </View>
  );
}

export function PresentationRequestSummary({
  request,
}: PresentationRequestSummaryProps) {
  const usesLocalhost = isLocalhostUrl(request.callbackUrl);
  const [showDetails, setShowDetails] = useState(false);

  return (
    <AppCard>
      <Text style={styles.title}>Solicitud de verificación recibida</Text>
      <Text style={styles.description}>
        Elige la credencial que deseas presentar.
      </Text>
      {usesLocalhost ? (
        <Text style={styles.warningText}>
          El enlace de verificación no es accesible desde este teléfono. Usa
          una IP local o un túnel público para pruebas con dispositivo físico.
        </Text>
      ) : null}
      <Pressable
        accessibilityRole="button"
        onPress={() => setShowDetails((current) => !current)}
      >
        <Text style={styles.detailsToggle}>
          {showDetails ? 'Ocultar detalles técnicos' : 'Ver detalles técnicos'}
        </Text>
      </Pressable>
      {showDetails ? (
        <View style={styles.details}>
          <SummaryRow
            label="Identificador"
            value={shortenMiddle(request.sessionId, 24)}
          />
          <SummaryRow label="Modo" value={request.mode} />
          <SummaryRow
            label="Enlace de entrega"
            value={shortenMiddle(request.callbackUrl, 56)}
          />
        </View>
      ) : null}
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
  details: {
    gap: spacing.md,
  },
  detailsToggle: {
    color: '#12344D',
    fontSize: typography.body,
    fontWeight: '700',
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
  warningText: {
    color: '#7A5412',
    fontSize: typography.body,
    lineHeight: 24,
  },
});

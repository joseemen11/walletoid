import { StyleSheet, Text, View } from 'react-native';

import type { ParsedCredentialOffer } from '../../domain/credentialOffer.types';
import { AppCard } from '@/src/shared/components/AppCard';
import { spacing } from '@/src/shared/theme/spacing';
import { typography } from '@/src/shared/theme/typography';

type CredentialOfferSummaryProps = {
  parsedOffer: ParsedCredentialOffer;
};

type SummaryRowProps = {
  label: string;
  value: string;
};

function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function getSourceTypeLabel(sourceType: ParsedCredentialOffer['sourceType']): string {
  switch (sourceType) {
    case 'json':
      return 'JSON directo';
    case 'credential_offer':
      return 'credential_offer';
    case 'credential_offer_uri':
      return 'credential_offer_uri';
    default:
      return sourceType;
  }
}

function getGrantLabel(parsedOffer: ParsedCredentialOffer): string {
  const grants = parsedOffer.offer.grants;

  if (grants?.['urn:ietf:params:oauth:grant-type:pre-authorized_code']) {
    return 'pre-authorized code';
  }

  if (grants?.authorization_code) {
    return 'authorization code';
  }

  return 'sin grant';
}

export function CredentialOfferSummary({
  parsedOffer,
}: CredentialOfferSummaryProps) {
  const txCode =
    parsedOffer.offer.grants?.[
      'urn:ietf:params:oauth:grant-type:pre-authorized_code'
    ]?.tx_code;

  return (
    <AppCard>
      <Text style={styles.title}>Resultado parseado</Text>
      <SummaryRow
        label="Tipo de fuente"
        value={getSourceTypeLabel(parsedOffer.sourceType)}
      />
      <SummaryRow
        label="Credential issuer"
        value={parsedOffer.offer.credential_issuer}
      />
      <SummaryRow
        label="Credential configuration IDs"
        value={
          parsedOffer.offer.credential_configuration_ids?.join(', ') ??
          'No disponibles'
        }
      />
      <SummaryRow label="Grant detectado" value={getGrantLabel(parsedOffer)} />

      {parsedOffer.credentialOfferUri ? (
        <SummaryRow
          label="credential_offer_uri"
          value={parsedOffer.credentialOfferUri}
        />
      ) : null}

      {txCode ? (
        <>
          <SummaryRow
            label="tx_code input_mode"
            value={txCode.input_mode ?? 'No disponible'}
          />
          <SummaryRow
            label="tx_code length"
            value={txCode.length?.toString() ?? 'No disponible'}
          />
          <SummaryRow
            label="tx_code description"
            value={txCode.description ?? 'No disponible'}
          />
        </>
      ) : null}

      <View style={styles.jsonSection}>
        <Text style={styles.jsonTitle}>Offer JSON</Text>
        <Text selectable style={styles.jsonBlock}>
          {JSON.stringify(parsedOffer.offer, null, 2)}
        </Text>
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
  rowLabel: {
    color: '#4E6A85',
    fontSize: typography.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  rowValue: {
    color: '#243746',
    fontSize: typography.body,
    lineHeight: 24,
  },
  jsonSection: {
    gap: spacing.sm,
  },
  jsonTitle: {
    color: '#0F1720',
    fontSize: typography.heading,
    fontWeight: '600',
  },
  jsonBlock: {
    backgroundColor: '#0F1720',
    borderRadius: 12,
    color: '#EAF1F7',
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: 20,
    padding: spacing.md,
  },
});

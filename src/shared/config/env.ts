export type IssuanceMode = 'mock' | 'real';

export const ISSUANCE_MODE: IssuanceMode =
  process.env.EXPO_PUBLIC_ISSUANCE_MODE === 'real' ? 'real' : 'mock';

export const OID4VCI_ISSUER_BASE_URL =
  process.env.EXPO_PUBLIC_OID4VCI_ISSUER_BASE_URL ?? '';

export const LACCHAIN_DEMO_ISSUER_BASE_URL =
  process.env.EXPO_PUBLIC_LACCHAIN_DEMO_ISSUER_BASE_URL ?? '';

export type IssuanceMode = 'mock' | 'real';

export const ISSUANCE_MODE: IssuanceMode =
  process.env.EXPO_PUBLIC_ISSUANCE_MODE === 'real' ? 'real' : 'mock';

export const OID4VCI_ISSUER_BASE_URL =
  process.env.EXPO_PUBLIC_OID4VCI_ISSUER_BASE_URL ?? '';

export const LACCHAIN_DEMO_ISSUER_BASE_URL =
  process.env.EXPO_PUBLIC_LACCHAIN_DEMO_ISSUER_BASE_URL ?? '';

const CIUDADANIA_DEFAULT_BASE_URL = 'http://localhost:3003';

export const CIUDADANIA_AUTH_URL =
  process.env.EXPO_PUBLIC_CIUDADANIA_AUTH_URL ??
  `${CIUDADANIA_DEFAULT_BASE_URL}/auth`;

export const CIUDADANIA_TOKEN_URL =
  process.env.EXPO_PUBLIC_CIUDADANIA_TOKEN_URL ??
  `${CIUDADANIA_DEFAULT_BASE_URL}/token`;

export const CIUDADANIA_USERINFO_URL =
  process.env.EXPO_PUBLIC_CIUDADANIA_USERINFO_URL ??
  `${CIUDADANIA_DEFAULT_BASE_URL}/me`;

export const CIUDADANIA_CLIENT_ID =
  process.env.EXPO_PUBLIC_CIUDADANIA_CLIENT_ID ?? 'wallet-mvp-test';

export const CIUDADANIA_REDIRECT_SCHEME =
  process.env.EXPO_PUBLIC_CIUDADANIA_REDIRECT_SCHEME ?? 'oid4vciwalletpoc';

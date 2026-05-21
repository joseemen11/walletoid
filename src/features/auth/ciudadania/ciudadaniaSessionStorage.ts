import * as SecureStore from 'expo-secure-store';

import type {
  CiudadaniaTokenResponse,
  CiudadaniaUserInfo,
} from './ciudadaniaAuthService';

export type CiudadaniaSession = {
  tokens: CiudadaniaTokenResponse;
  user: CiudadaniaUserInfo;
};

const CIUDADANIA_SESSION_KEY = 'oid4vci-wallet-poc.ciudadania-session.v1';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isCiudadaniaSession(value: unknown): value is CiudadaniaSession {
  if (!isRecord(value) || !isRecord(value.tokens) || !isRecord(value.user)) {
    return false;
  }

  return (
    typeof value.tokens.access_token === 'string' &&
    typeof value.tokens.id_token === 'string' &&
    typeof value.user.sub === 'string'
  );
}

export async function saveCiudadaniaSession(
  session: CiudadaniaSession,
): Promise<void> {
  await SecureStore.setItemAsync(
    CIUDADANIA_SESSION_KEY,
    JSON.stringify(session),
  );
}

export async function loadCiudadaniaSession(): Promise<CiudadaniaSession | null> {
  const rawValue = await SecureStore.getItemAsync(CIUDADANIA_SESSION_KEY);

  if (!rawValue) {
    return null;
  }

  const parsed: unknown = JSON.parse(rawValue);

  if (!isCiudadaniaSession(parsed)) {
    await clearCiudadaniaSession();
    return null;
  }

  return parsed;
}

export async function clearCiudadaniaSession(): Promise<void> {
  await SecureStore.deleteItemAsync(CIUDADANIA_SESSION_KEY);
}

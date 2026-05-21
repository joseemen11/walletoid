import type { DiscoveryDocument } from 'expo-auth-session';
import { generateHexStringAsync } from 'expo-auth-session/build/PKCE';

import {
  CIUDADANIA_AUTH_URL,
  CIUDADANIA_CLIENT_ID,
  CIUDADANIA_REDIRECT_SCHEME,
  CIUDADANIA_TOKEN_URL,
  CIUDADANIA_USERINFO_URL,
} from '@/src/shared/config/env';

export type CiudadaniaTokenResponse = {
  access_token: string;
  expires_in: number;
  id_token: string;
  scope: string;
  token_type: 'Bearer';
};

export type CiudadaniaUserInfo = {
  sub: string;
  profile?: {
    documento_identidad?: {
      numero_documento?: string;
      tipo_documento?: string;
    };
    nombre?: {
      nombres?: string;
      primer_apellido?: string;
      segundo_apellido?: string;
    };
  };
  email?: string;
  celular?: string;
  fecha_nacimiento?: string;
};

export type CiudadaniaDisplayUser = {
  fullName: string;
  document: string;
  email: string;
  celular: string;
  fechaNacimiento: string;
};

type UnknownRecord = Record<string, unknown>;

export const CIUDADANIA_SCOPES = [
  'openid',
  'profile',
  'fecha_nacimiento',
  'email',
  'celular',
];

export const ciudadaniaDiscovery: DiscoveryDocument = {
  authorizationEndpoint: CIUDADANIA_AUTH_URL,
  tokenEndpoint: CIUDADANIA_TOKEN_URL,
  userInfoEndpoint: CIUDADANIA_USERINFO_URL,
};

export function buildCiudadaniaRedirectUri(): string {
  return `${CIUDADANIA_REDIRECT_SCHEME}://auth/callback`;
}

export async function generateCiudadaniaNonce(): Promise<string> {
  return generateHexStringAsync(16);
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function buildResponseErrorMessage(
  endpointName: '/token' | '/me',
  status: number,
  payload: unknown,
): string {
  if (isRecord(payload)) {
    const error = readString(payload.error);
    const description =
      readString(payload.error_description) || readString(payload.message);

    if (description) {
      return `${endpointName} respondio HTTP ${status}: ${description}`;
    }

    if (error) {
      return `${endpointName} respondio HTTP ${status}: ${error}`;
    }
  }

  return `${endpointName} respondio con estado HTTP ${status}.`;
}

async function readJsonResponse(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function ensureTokenResponse(payload: unknown): CiudadaniaTokenResponse {
  if (!isRecord(payload)) {
    throw new Error('La respuesta de /token no devolvio un JSON valido.');
  }

  if (readString(payload.access_token) === undefined) {
    throw new Error('La respuesta de /token no incluye access_token.');
  }

  if (readString(payload.id_token) === undefined) {
    throw new Error('La respuesta de /token no incluye id_token.');
  }

  return {
    access_token: readString(payload.access_token) ?? '',
    expires_in:
      typeof payload.expires_in === 'number' ? payload.expires_in : 0,
    id_token: readString(payload.id_token) ?? '',
    scope: readString(payload.scope) ?? '',
    token_type: readString(payload.token_type) === 'Bearer' ? 'Bearer' : 'Bearer',
  };
}

export async function exchangeCiudadaniaCode(input: {
  code: string;
  codeVerifier: string;
  redirectUri: string;
}): Promise<CiudadaniaTokenResponse> {
  let response: Response;

  try {
    response = await fetch(CIUDADANIA_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: input.code,
        redirect_uri: input.redirectUri,
        code_verifier: input.codeVerifier,
        client_id: CIUDADANIA_CLIENT_ID,
      }).toString(),
    });
  } catch (error) {
    throw new Error(
      'No fue posible acceder a /token. Verifica que el backend mock este encendido y que la URL sea accesible desde el dispositivo.',
      { cause: error },
    );
  }

  const payload = await readJsonResponse(response);

  if (!response.ok) {
    throw new Error(buildResponseErrorMessage('/token', response.status, payload));
  }

  return ensureTokenResponse(payload);
}

export async function fetchCiudadaniaUserInfo(
  accessToken: string,
): Promise<CiudadaniaUserInfo> {
  let response: Response;

  try {
    response = await fetch(CIUDADANIA_USERINFO_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch (error) {
    throw new Error(
      'No fue posible acceder a /me. Verifica que el backend mock este encendido y que la URL sea accesible desde el dispositivo.',
      { cause: error },
    );
  }

  const payload = await readJsonResponse(response);

  if (!response.ok) {
    throw new Error(buildResponseErrorMessage('/me', response.status, payload));
  }

  if (!isRecord(payload) || readString(payload.sub) === undefined) {
    throw new Error('La respuesta de /me no tiene el formato esperado.');
  }

  return payload as CiudadaniaUserInfo;
}

export function mapCiudadaniaUserForDisplay(
  user: CiudadaniaUserInfo,
): CiudadaniaDisplayUser {
  const nombre = user.profile?.nombre;
  const documento = user.profile?.documento_identidad;
  const fullName = [
    nombre?.nombres,
    nombre?.primer_apellido,
    nombre?.segundo_apellido,
  ]
    .filter(Boolean)
    .join(' ');
  const document = [
    documento?.tipo_documento,
    documento?.numero_documento,
  ]
    .filter(Boolean)
    .join(' ');

  return {
    fullName: fullName || 'Sin nombre disponible',
    document: document || 'Sin documento disponible',
    email: user.email || 'Sin email disponible',
    celular: user.celular || 'Sin celular disponible',
    fechaNacimiento: user.fecha_nacimiento || 'Sin fecha disponible',
  };
}

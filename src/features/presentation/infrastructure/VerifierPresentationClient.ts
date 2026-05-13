import {
  AxiosError,
  create,
  type AxiosInstance,
} from 'axios';

import type { VerifierPresentationResponse } from '../domain/verifierPresentation.types';
import { VerifierPresentationNetworkError } from '../domain/verifierPresentationErrors';

const PRESENTATION_TIMEOUT_MS = 15000;

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStatus(value: unknown): value is VerifierPresentationResponse['status'] {
  return value === 'verified' || value === 'failed' || value === 'expired';
}

function normalizePresentationResponse(
  payload: unknown,
  fallbackSessionId: string,
): VerifierPresentationResponse {
  if (payload === null || payload === undefined || payload === '') {
    throw new VerifierPresentationNetworkError(
      'El verificador no devolvió una respuesta válida.',
    );
  }

  if (!isRecord(payload)) {
    throw new VerifierPresentationNetworkError(
      'El verificador no devolvió una respuesta válida.',
    );
  }

  const sessionId =
    typeof payload.sessionId === 'string' && payload.sessionId.trim()
      ? payload.sessionId
      : fallbackSessionId;
  const status = isStatus(payload.status) ? payload.status : 'failed';
  const verificationResult = isRecord(payload.verificationResult)
    ? payload.verificationResult
    : undefined;

  return {
    sessionId,
    status,
    verificationResult: verificationResult as VerifierPresentationResponse['verificationResult'],
    error: typeof payload.error === 'string' ? payload.error : undefined,
  };
}

function extractSessionIdFromCallbackUrl(callbackUrl: string): string {
  try {
    const url = new URL(callbackUrl);
    const parts = url.pathname.split('/').filter(Boolean);
    const sessionIndex = parts.findIndex((part) => part === 'sessions');

    if (sessionIndex >= 0 && parts[sessionIndex + 1]) {
      return parts[sessionIndex + 1];
    }
  } catch {
    return 'unknown-session';
  }

  return 'unknown-session';
}

function isLikelyLocalhostUrl(url: string): boolean {
  return url.includes('localhost') || url.includes('127.0.0.1');
}

function isLikelyNetworkError(error: AxiosError): boolean {
  return (
    error.message === 'Network Error' ||
    error.code === 'ERR_NETWORK' ||
    error.code === 'ECONNREFUSED' ||
    error.code === 'ENETUNREACH'
  );
}

function buildAxiosErrorMessage(error: unknown, callbackUrl: string): string {
  const localhostHint = isLikelyLocalhostUrl(callbackUrl)
    ? ' El enlace de verificación no es accesible desde este teléfono. Usa una IP local o un túnel público para pruebas con dispositivo físico.'
    : '';

  if (error instanceof AxiosError) {
    if (error.response) {
      return `El verificador no pudo procesar la presentación.${localhostHint}`;
    }

    if (error.code === 'ECONNABORTED' || error.code === 'ERR_CANCELED') {
      return `La conexión con el verificador tardó demasiado.${localhostHint}`;
    }

    if (isLikelyNetworkError(error)) {
      return `No se pudo conectar con el verificador. Verifica que el teléfono y la computadora estén en la misma red o usa un enlace público de prueba.${localhostHint}`;
    }

    return `No se pudo conectar con el verificador.${localhostHint}`;
  }

  return `No se pudo conectar con el verificador.${localhostHint}`;
}

export class VerifierPresentationClient {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = create({
      timeout: PRESENTATION_TIMEOUT_MS,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
  }

  async submitPresentation(
    callbackUrl: string,
    vc: unknown,
  ): Promise<VerifierPresentationResponse> {
    if (isLikelyLocalhostUrl(callbackUrl)) {
      throw new VerifierPresentationNetworkError(
        'El enlace de verificación no es accesible desde este teléfono. Usa una IP local o un túnel público para pruebas con dispositivo físico.',
      );
    }

    const fallbackSessionId = extractSessionIdFromCallbackUrl(callbackUrl);
    let payload: unknown;

    try {
      const response = await this.client.post(callbackUrl, { vc }, {
        timeout: PRESENTATION_TIMEOUT_MS,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      payload = response.data;
    } catch (error) {
      if (error instanceof VerifierPresentationNetworkError) {
        throw error;
      }

      throw new VerifierPresentationNetworkError(
        buildAxiosErrorMessage(error, callbackUrl),
        { cause: error },
      );
    }

    return normalizePresentationResponse(payload, fallbackSessionId);
  }
}

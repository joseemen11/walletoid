import type { VerifierPresentationQrPayload } from '../domain/verifierPresentation.types';
import { VerifierPresentationQrParseError } from '../domain/verifierPresentationErrors';

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readRequiredString(
  payload: UnknownRecord,
  key: 'sessionId' | 'callbackUrl' | 'createdAt',
  message: string,
): string {
  const value = payload[key];

  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new VerifierPresentationQrParseError(message);
  }

  return value;
}

export function parseVerifierQrPayload(
  rawQrValue: string,
): VerifierPresentationQrPayload {
  const trimmedValue = rawQrValue.trim();

  if (!trimmedValue) {
    throw new VerifierPresentationQrParseError(
      'El QR no contiene un JSON valido.',
    );
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(trimmedValue);
  } catch (error) {
    throw new VerifierPresentationQrParseError(
      'El QR no contiene un JSON valido.',
      { cause: error },
    );
  }

  if (!isRecord(parsed)) {
    throw new VerifierPresentationQrParseError(
      'El QR no corresponde a una solicitud de presentacion compatible.',
    );
  }

  if (parsed.type !== 'VERIFIER_PRESENTATION_REQUEST_POC') {
    throw new VerifierPresentationQrParseError(
      'El QR no corresponde a una solicitud de presentacion compatible.',
    );
  }

  if (parsed.acceptedFormat !== 'w3c-vc-json') {
    throw new VerifierPresentationQrParseError(
      'La solicitud no es compatible con esta wallet.',
    );
  }

  if (parsed.mode !== 'HTTP_JSON_PRESENTATION_POC') {
    throw new VerifierPresentationQrParseError(
      'La solicitud no es compatible con esta wallet.',
    );
  }

  return {
    type: 'VERIFIER_PRESENTATION_REQUEST_POC',
    sessionId: readRequiredString(
      parsed,
      'sessionId',
      'La solicitud está incompleta.',
    ),
    callbackUrl: readRequiredString(
      parsed,
      'callbackUrl',
      'La solicitud está incompleta.',
    ),
    acceptedFormat: 'w3c-vc-json',
    mode: 'HTTP_JSON_PRESENTATION_POC',
    createdAt: readRequiredString(
      parsed,
      'createdAt',
      'La solicitud está incompleta.',
    ),
  };
}

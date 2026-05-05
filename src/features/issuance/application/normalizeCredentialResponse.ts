import type { StoredCredential } from '@/src/features/wallet/domain/credential.types';

import type { CredentialOffer } from '../domain/credentialOffer.types';
import type { CredentialResponse } from '../domain/credentialResponse.types';

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function readStringArray(value: unknown): string[] | undefined {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
    ? value
    : undefined;
}

function readCredentialPayload(
  response: CredentialResponse,
): unknown | undefined {
  if (response.credential !== undefined) {
    return response.credential;
  }

  if (Array.isArray(response.credentials) && response.credentials.length > 0) {
    return response.credentials[0];
  }

  return undefined;
}

function inferId(payload: unknown): string | undefined {
  if (!isRecord(payload)) {
    return undefined;
  }

  return readString(payload.id);
}

function inferIssuer(
  payload: unknown,
  offer: CredentialOffer,
): string {
  if (isRecord(payload)) {
    return readString(payload.issuer) ?? offer.credential_issuer;
  }

  return offer.credential_issuer;
}

function inferType(payload: unknown): string[] {
  if (isRecord(payload)) {
    const type = readStringArray(payload.type);

    if (type) {
      return type;
    }

    const vct = readString(payload.vct);

    if (vct) {
      return ['VerifiableCredential', vct];
    }
  }

  return ['VerifiableCredential'];
}

function inferSubjectId(payload: unknown): string | undefined {
  if (!isRecord(payload)) {
    return undefined;
  }

  const credentialSubject = payload.credentialSubject;

  if (isRecord(credentialSubject)) {
    return readString(credentialSubject.id);
  }

  return undefined;
}

function inferIssuanceDate(payload: unknown): string | undefined {
  if (!isRecord(payload)) {
    return undefined;
  }

  return (
    readString(payload.issuanceDate) ??
    readString(payload.validFrom) ??
    readString(payload.issued_at)
  );
}

export function normalizeCredentialResponse(
  response: CredentialResponse,
  offer: CredentialOffer,
): StoredCredential {
  const now = new Date().toISOString();
  const primaryCredential = readCredentialPayload(response);

  return {
    id: inferId(primaryCredential) ?? `real-credential-${Date.now()}`,
    format: response.format ?? 'unknown',
    type: inferType(primaryCredential),
    issuer: inferIssuer(primaryCredential, offer),
    subjectId: inferSubjectId(primaryCredential),
    issuanceDate: inferIssuanceDate(primaryCredential),
    raw: {
      credential: response.credential,
      credentials: response.credentials,
      raw: response.raw ?? response,
      lacchainEvidence: response.lacchainEvidence,
    },
    createdAt: now,
    updatedAt: now,
  };
}

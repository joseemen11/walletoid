import type { StoredCredential } from '@/src/features/wallet/domain/credential.types';

import { VerifiableCredentialExtractionError } from '../domain/verifierPresentationErrors';

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasVcSignals(value: unknown): value is UnknownRecord {
  if (!isRecord(value)) {
    return false;
  }

  return (
    value.issuer !== undefined &&
    value.credentialSubject !== undefined &&
    value.proof !== undefined
  );
}

export function extractVerifiableCredentialFromStoredCredential(
  storedCredential: StoredCredential,
): unknown {
  const raw = storedCredential.raw;
  const candidates: { source: string; value: unknown }[] = [];

  if (isRecord(raw)) {
    const firstCredential = Array.isArray(raw.credentials)
      ? raw.credentials[0]
      : undefined;

    candidates.push(
      { source: 'raw.vc', value: raw.vc },
      { source: 'raw.credential', value: raw.credential },
      { source: 'raw.credentials[0]', value: firstCredential },
      { source: 'raw directly', value: raw },
    );
  } else {
    candidates.push({ source: 'raw directly', value: raw });
  }

  const candidate = candidates.find(({ value }) => hasVcSignals(value))?.value;

  if (!candidate) {
    throw new VerifiableCredentialExtractionError(
      'La credencial seleccionada no contiene una VC valida para presentar.',
    );
  }

  return candidate;
}

import type { StoredCredential } from '@/src/features/wallet/domain/credential.types';

import type { MockCredentialResponse } from '../domain/issuanceFlow.types';

export function mapIssuedCredentialToStoredCredential(
  credentialResponse: MockCredentialResponse,
): StoredCredential {
  const now = new Date().toISOString();

  return {
    id: credentialResponse.credentialId,
    format: credentialResponse.format,
    type: credentialResponse.credentialType,
    issuer: credentialResponse.issuer,
    subjectId: credentialResponse.subjectId,
    subjectName: credentialResponse.subjectName,
    issuanceDate: credentialResponse.issuanceDate,
    raw: {
      credential: credentialResponse.credential,
      raw: credentialResponse.raw,
      lacchainEvidence: credentialResponse.lacchainEvidence,
    },
    createdAt: now,
    updatedAt: now,
  };
}

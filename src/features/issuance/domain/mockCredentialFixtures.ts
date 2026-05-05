import type { MockCredentialResponse } from './issuanceFlow.types';

export function createMockSdJwtVcCredential(params: {
  issuer: string;
  credentialType?: string;
}): MockCredentialResponse {
  const now = new Date().toISOString();
  const credentialId = `mock-sd-jwt-vc-${Date.now()}`;

  return {
    format: 'sd_jwt_vc',
    credential: 'mock.header.payload.signature~mock-disclosure-1~mock-disclosure-2',
    credentialId,
    issuer: params.issuer,
    subjectId: 'did:example:holder-123',
    subjectName: 'Demo Holder',
    credentialType: [
      'VerifiableCredential',
      params.credentialType ?? 'UniversityDegreeCredential',
    ],
    issuanceDate: now,
    raw: {
      note: 'Mock SD-JWT VC. No tiene firma criptografica real.',
      compact:
        'mock.header.payload.signature~mock-disclosure-1~mock-disclosure-2',
      claims: {
        sub: 'did:example:holder-123',
        name: 'Demo Holder',
        degree: 'Ingenieria de Sistemas',
      },
      issuer: params.issuer,
      issued_at: now,
    },
    lacchainEvidence: {
      mode: 'pending',
      registry: 'LACChain integration pendiente',
    },
  };
}

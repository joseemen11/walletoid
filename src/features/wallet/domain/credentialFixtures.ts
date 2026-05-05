import type { StoredCredential } from './credential.types';

export function createDemoStoredCredential(): StoredCredential {
  const now = new Date().toISOString();

  return {
    id: 'demo-university-degree-001',
    format: 'ldp_vc',
    type: ['VerifiableCredential', 'UniversityDegreeCredential'],
    issuer: 'did:example:issuer-university',
    subjectId: 'did:example:holder-123',
    subjectName: 'Demo Holder',
    issuanceDate: now,
    raw: {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      id: 'urn:uuid:demo-credential-001',
      type: ['VerifiableCredential', 'UniversityDegreeCredential'],
      issuer: 'did:example:issuer-university',
      issuanceDate: now,
      credentialSubject: {
        id: 'did:example:holder-123',
        name: 'Demo Holder',
        degree: {
          type: 'BachelorDegree',
          name: 'Ingenieria de Sistemas',
        },
      },
      proof: {
        type: 'DataIntegrityProof',
        cryptosuite: 'mock',
        created: now,
        verificationMethod: 'did:example:issuer-university#key-1',
        proofPurpose: 'assertionMethod',
        proofValue: 'mock-proof-value',
      },
    },
    createdAt: now,
    updatedAt: now,
  };
}

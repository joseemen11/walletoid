import type { StoredCredential } from '@/src/features/wallet/domain/credential.types';

import type { LacchainDemoIssuanceResult } from '../domain/lacchainDemo.types';

function normalizeType(value: string | string[] | undefined): string[] {
  if (typeof value === 'string') {
    return [value];
  }

  if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
    return value;
  }

  return ['VerifiableCredential'];
}

function buildSubjectName(holderDid: string): string {
  if (holderDid.length <= 24) {
    return 'Holder DID';
  }

  return `Holder DID (${holderDid.slice(0, 18)}...)`;
}

export function mapLacchainVcToStoredCredential(
  result: LacchainDemoIssuanceResult,
): StoredCredential {
  const now = new Date().toISOString();
  const subjectId = result.vc.credentialSubject?.id ?? result.holderDid;

  return {
    id:
      typeof result.vc.id === 'string'
        ? result.vc.id
        : `lacchain-vc-${Date.now()}`,
    format: 'ldp_vc',
    type: normalizeType(result.vc.type),
    issuer: result.vc.issuer ?? 'Issuer no identificado',
    subjectId,
    subjectName: buildSubjectName(subjectId),
    issuanceDate: result.vc.issuanceDate,
    expirationDate: result.vc.expirationDate,
    raw: {
      source: 'lacchain-demo-issuer',
      holderDid: result.holderDid,
      vc: result.vc,
      lacchainEvidence: {
        mode: 'real',
        registry: 'issuer-demo-endpoint',
        issuerDid: result.vc.issuer,
        holderDid: result.holderDid,
      },
    },
    createdAt: now,
    updatedAt: now,
  };
}

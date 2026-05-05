import type { CredentialOffer } from './credentialOffer.types';
import type { CredentialResponse } from './credentialResponse.types';
import type { IssuerMetadata } from './issuerMetadata.types';
import type { TokenResponse } from './tokenResponse.types';

export type IssuanceFlowStep =
  | 'idle'
  | 'offer_parsed'
  | 'metadata_loaded'
  | 'token_received'
  | 'credential_received'
  | 'stored'
  | 'error';

export type { IssuerMetadata };

export type MockTokenResponse = TokenResponse & {
  token_type: 'Bearer';
  expires_in: number;
};

export type MockCredentialResponse = CredentialResponse & {
  format: 'sd_jwt_vc';
  credential: string;
  credentialId: string;
  issuer: string;
  subjectId: string;
  subjectName: string;
  credentialType: string[];
  issuanceDate: string;
  raw: unknown;
  lacchainEvidence?: {
    mode: 'mock' | 'pending' | 'real';
    credentialHash?: string;
    txHash?: string;
    registry?: string;
  };
};

export type MockIssueCredentialInput = {
  offer: CredentialOffer;
  accessToken: string;
  cNonce?: string;
};

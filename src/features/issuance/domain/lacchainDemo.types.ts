export type LacchainDidResponse = {
  did: string;
  privateKey: string;
};

export type LacchainVcProof = {
  id?: string;
  type?: string;
  proofPurpose?: string;
  verificationMethod?: string;
  domain?: string;
  proofValue?: string;
};

export type LacchainVerifiableCredential = {
  '@context'?: string | string[];
  id?: string;
  type?: string | string[];
  issuer?: string;
  issuanceDate?: string;
  expirationDate?: string;
  credentialSubject?: {
    id?: string;
    [key: string]: unknown;
  };
  proof?: LacchainVcProof | LacchainVcProof[];
  [key: string]: unknown;
};

export type LacchainDemoIssuanceResult = {
  holderDid: string;
  vc: LacchainVerifiableCredential;
};

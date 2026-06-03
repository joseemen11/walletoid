export type SignatureMode = 'POC_SOFTOKEN' | 'REAL_SOFTOKEN_PENDING';

export type ValidationStatus =
  | 'POC_VALID'
  | 'POC_INVALID'
  | 'MISSING_CERTIFICATE';

export type DigitalCertificatePoc = {
  mode: SignatureMode;
  subjectName: string;
  subjectDocument: string;
  issuer: string;
  serialNumber: string;
  fingerprint: string;
  validFrom: string;
  validTo: string;
  importedAt: string;
};

export type SignerIdentity = {
  userId?: string;
  name?: string;
  document?: string;
  source: 'CIUDADANIA_DIGITAL' | 'LOCAL_DEMO';
};

export type DigitalSignatureEvidence = {
  mode: SignatureMode;
  payloadOriginal: unknown;
  payloadCanonical: string;
  documentHash: string;
  signatureValue: string;
  signatureHash: string;
  certificate: DigitalCertificatePoc;
  signerIdentity: SignerIdentity;
  validationStatus: ValidationStatus;
  signedAt: string;
  validatedAt?: string;
  blockchainTxHash?: string;
  receiptStatus?: string;
  registeredAt?: string;
  note: string;
};

export type SignatureValidationResult = {
  status: ValidationStatus;
  validatedAt: string;
  reason?: string;
};

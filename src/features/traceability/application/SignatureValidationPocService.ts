import type {
  DigitalSignatureEvidence,
  SignatureValidationResult,
} from '../domain/digitalSignature.types';

export function validatePocSignature(
  evidence: DigitalSignatureEvidence,
): SignatureValidationResult {
  const validatedAt = new Date().toISOString();

  if (!evidence.certificate?.serialNumber) {
    return {
      status: 'MISSING_CERTIFICATE',
      validatedAt,
      reason: 'No existe certificado PoC asociado a la evidencia.',
    };
  }

  if (
    !evidence.documentHash ||
    !evidence.signatureValue ||
    !evidence.signatureHash ||
    !evidence.signerIdentity
  ) {
    return {
      status: 'POC_INVALID',
      validatedAt,
      reason: 'La evidencia de firma PoC esta incompleta.',
    };
  }

  return {
    status: 'POC_VALID',
    validatedAt,
  };
}

import {
  canonicalizePayload,
  createDocumentHash,
} from './traceabilityPayloadService';
import type {
  DigitalCertificatePoc,
  DigitalSignatureEvidence,
  SignerIdentity,
} from '../domain/digitalSignature.types';

const POC_SIGNATURE_NOTE =
  'Firma generada en entorno PoC. Pendiente de integración con softoken .p12 real y Validador Web/API oficial.';

type SignTraceabilityPayloadPocParams = {
  payloadOriginal: unknown;
  payloadCanonical: string;
  documentHash: string;
  signerIdentity: SignerIdentity;
  certificate: DigitalCertificatePoc;
  password: string;
};

export async function signTraceabilityPayloadPoc({
  payloadOriginal,
  payloadCanonical,
  documentHash,
  signerIdentity,
  certificate,
  password,
}: SignTraceabilityPayloadPocParams): Promise<DigitalSignatureEvidence> {
  if (!certificate) {
    throw new Error('No existe un certificado PoC cargado.');
  }

  if (!password.trim()) {
    throw new Error('Ingresa el PIN o contraseña del softoken.');
  }

  const signedAt = new Date().toISOString();
  const signatureSeed = canonicalizePayload({
    certificateSerialNumber: certificate.serialNumber,
    documentHash,
    signedAt,
    signerIdentity,
  });
  const signatureValue = await createDocumentHash(signatureSeed);
  const signatureHash = await createDocumentHash(signatureValue);

  return {
    mode: 'POC_SOFTOKEN',
    payloadOriginal,
    payloadCanonical,
    documentHash,
    signatureValue,
    signatureHash,
    certificate,
    signerIdentity,
    validationStatus: 'POC_INVALID',
    signedAt,
    note: POC_SIGNATURE_NOTE,
  };
}

import type {
  DigitalCertificatePoc,
  SignerIdentity,
} from '../domain/digitalSignature.types';

let loadedPocCertificate: DigitalCertificatePoc | null = null;

export function getLoadedPocCertificate(): DigitalCertificatePoc | null {
  return loadedPocCertificate;
}

export function loadPocSoftokenCertificate(
  signerIdentity?: Partial<SignerIdentity>,
): DigitalCertificatePoc {
  const now = new Date();
  const validTo = new Date(now);
  validTo.setFullYear(validTo.getFullYear() + 1);

  // TODO: reemplazar este certificado PoC por importacion real de softoken .p12.
  loadedPocCertificate = {
    mode: 'POC_SOFTOKEN',
    subjectName: signerIdentity?.name ?? 'Usuario Demo Ciudadania Digital',
    subjectDocument:
      signerIdentity?.document ?? signerIdentity?.userId ?? 'CI-DEMO-0001',
    issuer: 'AGETIC - PoC / Firma Digital Bolivia',
    serialNumber: 'POC-P12-2026-0001',
    fingerprint:
      'sha256:8eec5d159a6f8d102d58e7d8f86f7c2bcbd6eb5e4ec52bd70c6731f8ad48f4f8',
    validFrom: now.toISOString(),
    validTo: validTo.toISOString(),
    importedAt: now.toISOString(),
  };

  return loadedPocCertificate;
}

export function clearPocCertificate(): void {
  loadedPocCertificate = null;
}

export type CredentialFormat =
  | 'jwt_vc_json'
  | 'ldp_vc'
  | 'sd_jwt_vc'
  | 'mso_mdoc'
  | 'unknown';

export type StoredCredential = {
  id: string;
  format: CredentialFormat;
  type: string[];
  issuer: string;
  subjectId?: string;
  subjectName?: string;
  issuanceDate?: string;
  expirationDate?: string;
  raw: unknown;
  createdAt: string;
  updatedAt: string;
};

export function getCredentialPrimaryType(
  credential: StoredCredential,
): string {
  return (
    credential.type.find((item) => item !== 'VerifiableCredential') ??
    credential.type[0] ??
    'Credencial'
  );
}

export function getCredentialDisplaySubject(
  credential: StoredCredential,
): string {
  return credential.subjectName ?? credential.subjectId ?? 'Sujeto no identificado';
}

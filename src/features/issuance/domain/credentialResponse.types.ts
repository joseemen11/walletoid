export type CredentialResponse = {
  format?: 'jwt_vc_json' | 'ldp_vc' | 'sd_jwt_vc' | 'mso_mdoc' | 'unknown';
  credential?: unknown;
  credentials?: unknown[];
  c_nonce?: string;
  c_nonce_expires_in?: number;
  raw?: unknown;
  lacchainEvidence?: {
    mode: 'mock' | 'pending' | 'real';
    credentialHash?: string;
    txHash?: string;
    registry?: string;
  };
};

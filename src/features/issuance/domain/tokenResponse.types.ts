export type TokenResponse = {
  access_token: string;
  token_type?: string;
  expires_in?: number;
  c_nonce?: string;
  c_nonce_expires_in?: number;
};

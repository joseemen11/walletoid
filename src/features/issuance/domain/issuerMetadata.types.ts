export type CredentialConfigurationSupported = {
  format?: 'jwt_vc_json' | 'ldp_vc' | 'sd_jwt_vc' | 'mso_mdoc' | 'unknown';
  scope?: string;
  cryptographic_binding_methods_supported?: string[];
  credential_signing_alg_values_supported?: string[];
  display?: {
    name?: string;
    locale?: string;
  }[];
};

export type IssuerMetadata = {
  credential_issuer: string;
  credential_endpoint: string;
  token_endpoint?: string;
  authorization_servers?: string[];
  credential_configurations_supported?: Record<
    string,
    CredentialConfigurationSupported
  >;
};

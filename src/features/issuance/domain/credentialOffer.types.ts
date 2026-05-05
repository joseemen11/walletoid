export type TxCode = {
  input_mode?: string;
  length?: number;
  description?: string;
};

export type PreAuthorizedCodeGrant = {
  'pre-authorized_code': string;
  tx_code?: TxCode;
};

export type AuthorizationCodeGrant = {
  issuer_state?: string;
};

export type CredentialOfferGrants = {
  authorization_code?: AuthorizationCodeGrant;
  'urn:ietf:params:oauth:grant-type:pre-authorized_code'?: PreAuthorizedCodeGrant;
};


export type CredentialOffer = {
  credential_issuer: string;
  credential_configuration_ids?: string[];
  grants?: CredentialOfferGrants;
};

export type ParsedCredentialOffer = {
  sourceType: 'json' | 'credential_offer' | 'credential_offer_uri';
  offer: CredentialOffer;
  rawInput: string;
  credentialOfferUri?: string;
};

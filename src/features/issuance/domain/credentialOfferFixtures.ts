import type { CredentialOffer } from './credentialOffer.types';

export const MOCK_CREDENTIAL_OFFER: CredentialOffer = {
  credential_issuer: 'https://issuer.example.test',
  credential_configuration_ids: ['UniversityDegreeCredential'],
  grants: {
    'urn:ietf:params:oauth:grant-type:pre-authorized_code': {
      'pre-authorized_code': 'mock-pre-authorized-code-123',
      tx_code: {
        input_mode: 'numeric',
        length: 6,
        description: 'Codigo de prueba para demo',
      },
    },
  },
};

export const MOCK_CREDENTIAL_OFFER_JSON = JSON.stringify(
  MOCK_CREDENTIAL_OFFER,
  null,
  2,
);

export const MOCK_CREDENTIAL_OFFER_URI = `openid-credential-offer://?credential_offer=${encodeURIComponent(
  JSON.stringify(MOCK_CREDENTIAL_OFFER),
)}`;

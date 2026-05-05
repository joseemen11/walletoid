import type { CredentialOffer } from '../domain/credentialOffer.types';
import { CredentialOfferParseError } from '../domain/issuanceErrors';
import { createMockSdJwtVcCredential } from '../domain/mockCredentialFixtures';
import type { IssuerClient, RequestCredentialInput } from './IssuerClient';
import type {
  IssuerMetadata,
  MockCredentialResponse,
  MockTokenResponse,
} from '../domain/issuanceFlow.types';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function normalizeIssuerBaseUrl(issuer: string): string {
  return issuer.endsWith('/') ? issuer.slice(0, -1) : issuer;
}

export class MockOid4vciIssuerClient implements IssuerClient {
  async getIssuerMetadata(offer: CredentialOffer): Promise<IssuerMetadata> {
    await delay(250);

    const issuerBaseUrl = normalizeIssuerBaseUrl(offer.credential_issuer);
    const supportedConfigurations =
      offer.credential_configuration_ids?.length
        ? offer.credential_configuration_ids
        : ['UniversityDegreeCredential'];

    return {
      credential_issuer: offer.credential_issuer,
      credential_endpoint: `${issuerBaseUrl}/credential`,
      token_endpoint: `${issuerBaseUrl}/oauth/token`,
      credential_configurations_supported: Object.fromEntries(
        supportedConfigurations.map((configurationId) => [
          configurationId,
          {
            format: 'sd_jwt_vc',
            scope: `mock:${configurationId}`,
            cryptographic_binding_methods_supported: ['did'],
            credential_signing_alg_values_supported: ['ES256'],
            display: [
              {
                name: configurationId,
                locale: 'es-AR',
              },
            ],
          },
        ]),
      ),
    };
  }

  async requestToken(offer: CredentialOffer): Promise<MockTokenResponse> {
    await delay(250);

    const preAuthorizedGrant =
      offer.grants?.['urn:ietf:params:oauth:grant-type:pre-authorized_code'];

    if (!preAuthorizedGrant && !offer.grants?.authorization_code) {
      throw new CredentialOfferParseError(
        'El credential offer no contiene grants compatibles para el flujo mock.',
      );
    }

    return {
      access_token: `mock-access-token-${Date.now()}`,
      token_type: 'Bearer',
      expires_in: 300,
      c_nonce: preAuthorizedGrant ? `mock-c-nonce-${Date.now()}` : undefined,
      c_nonce_expires_in: preAuthorizedGrant ? 300 : undefined,
    };
  }

  async requestCredential(
    input: RequestCredentialInput,
  ): Promise<MockCredentialResponse> {
    await delay(250);

    if (!input.accessToken) {
      throw new CredentialOfferParseError(
        'No se puede solicitar la credencial mock sin access token.',
      );
    }

    return createMockSdJwtVcCredential({
      issuer: input.offer.credential_issuer,
      credentialType: input.offer.credential_configuration_ids?.[0],
    });
  }
}

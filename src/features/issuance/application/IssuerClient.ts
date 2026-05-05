import type { CredentialOffer } from '../domain/credentialOffer.types';
import type { CredentialResponse } from '../domain/credentialResponse.types';
import type { IssuerMetadata } from '../domain/issuerMetadata.types';
import type { TokenResponse } from '../domain/tokenResponse.types';

export type RequestCredentialInput = {
  offer: CredentialOffer;
  accessToken: string;
  cNonce?: string;
};

export interface IssuerClient {
  resolveCredentialOfferUri?(credentialOfferUri: string): Promise<CredentialOffer>;
  getIssuerMetadata(offer: CredentialOffer): Promise<IssuerMetadata>;
  requestToken(offer: CredentialOffer): Promise<TokenResponse>;
  requestCredential(input: RequestCredentialInput): Promise<CredentialResponse>;
}

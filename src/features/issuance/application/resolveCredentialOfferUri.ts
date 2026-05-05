import { ensureCredentialOffer } from './parseCredentialOffer';
import { CredentialOfferParseError } from '../domain/issuanceErrors';
import type { CredentialOffer } from '../domain/credentialOffer.types';

export async function resolveCredentialOfferUri(
  credentialOfferUri: string,
): Promise<CredentialOffer> {
  let response: Response;

  try {
    response = await fetch(credentialOfferUri);
  } catch (error) {
    throw new CredentialOfferParseError(
      'No fue posible acceder a credential_offer_uri. Verifica red, CORS o que el issuer sea accesible desde el dispositivo.',
      { cause: error },
    );
  }

  if (!response.ok) {
    throw new CredentialOfferParseError(
      `credential_offer_uri respondio con estado HTTP ${response.status}.`,
    );
  }

  let payload: unknown;

  try {
    payload = await response.json();
  } catch (error) {
    throw new CredentialOfferParseError(
      'credential_offer_uri no devolvio un JSON valido.',
      { cause: error },
    );
  }

  return ensureCredentialOffer(payload);
}

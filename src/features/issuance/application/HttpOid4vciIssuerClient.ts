import type { CredentialOffer } from '../domain/credentialOffer.types';
import type { CredentialResponse } from '../domain/credentialResponse.types';
import type {
  CredentialConfigurationSupported,
  IssuerMetadata,
} from '../domain/issuerMetadata.types';
import type { TokenResponse } from '../domain/tokenResponse.types';
import { CredentialOfferParseError } from '../domain/issuanceErrors';
import type { IssuerClient, RequestCredentialInput } from './IssuerClient';
import { resolveCredentialOfferUri as fetchCredentialOfferUri } from './resolveCredentialOfferUri';

type HttpOid4vciIssuerClientOptions = {
  fallbackIssuerBaseUrl?: string;
};

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function toCredentialConfigurationsSupported(
  value: unknown,
): Record<string, CredentialConfigurationSupported> | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(value).filter(([, configuration]) => isRecord(configuration)),
  ) as Record<string, CredentialConfigurationSupported>;
}

function normalizeBaseUrl(value: string): string {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

function joinUrl(baseUrl: string, path: string): string {
  return `${normalizeBaseUrl(baseUrl)}${path}`;
}

function ensureIssuerBaseUrl(
  offer: CredentialOffer,
  fallbackIssuerBaseUrl?: string,
): string {
  const issuerBaseUrl = offer.credential_issuer || fallbackIssuerBaseUrl || '';

  if (!issuerBaseUrl) {
    throw new CredentialOfferParseError(
      'No fue posible determinar credential_issuer para el flujo real OID4VCI.',
    );
  }

  return normalizeBaseUrl(issuerBaseUrl);
}

async function parseJsonResponse(
  response: Response,
  errorMessage: string,
): Promise<unknown> {
  try {
    return await response.json();
  } catch (error) {
    throw new CredentialOfferParseError(errorMessage, { cause: error });
  }
}

export class HttpOid4vciIssuerClient implements IssuerClient {
  constructor(
    private readonly options: HttpOid4vciIssuerClientOptions = {},
  ) {}

  async resolveCredentialOfferUri(
    credentialOfferUri: string,
  ): Promise<CredentialOffer> {
    return fetchCredentialOfferUri(credentialOfferUri);
  }

  async getIssuerMetadata(offer: CredentialOffer): Promise<IssuerMetadata> {
    const issuerBaseUrl = ensureIssuerBaseUrl(
      offer,
      this.options.fallbackIssuerBaseUrl,
    );
    const metadataUrl = joinUrl(
      issuerBaseUrl,
      '/.well-known/openid-credential-issuer',
    );

    let response: Response;

    try {
      response = await fetch(metadataUrl);
    } catch (error) {
      throw new CredentialOfferParseError(
        'No fue posible obtener la metadata del issuer. Verifica conectividad, CORS o que el backend sea accesible desde el dispositivo.',
        { cause: error },
      );
    }

    if (!response.ok) {
      throw new CredentialOfferParseError(
        `La metadata del issuer no esta disponible. HTTP ${response.status}.`,
      );
    }

    const payload = await parseJsonResponse(
      response,
      'La metadata del issuer no devolvio un JSON valido.',
    );

    if (!isRecord(payload)) {
      throw new CredentialOfferParseError(
        'La metadata del issuer no tiene el formato esperado.',
      );
    }

    const credentialIssuer = payload.credential_issuer;
    const credentialEndpoint = payload.credential_endpoint;

    if (typeof credentialIssuer !== 'string') {
      throw new CredentialOfferParseError(
        'La metadata del issuer no incluye credential_issuer como string.',
      );
    }

    if (typeof credentialEndpoint !== 'string') {
      throw new CredentialOfferParseError(
        'La metadata del issuer no incluye credential_endpoint como string.',
      );
    }

    return {
      ...payload,
      credential_issuer: credentialIssuer,
      credential_endpoint: credentialEndpoint,
      token_endpoint:
        typeof payload.token_endpoint === 'string'
          ? payload.token_endpoint
          : joinUrl(credentialIssuer, '/token'), // Fallback de PoC: el backend real deberia publicar token_endpoint.
      authorization_servers: isStringArray(payload.authorization_servers)
        ? payload.authorization_servers
        : undefined,
      credential_configurations_supported: toCredentialConfigurationsSupported(
        payload.credential_configurations_supported,
      ),
    };
  }

  async requestToken(offer: CredentialOffer): Promise<TokenResponse> {
    const preAuthorizedGrant =
      offer.grants?.['urn:ietf:params:oauth:grant-type:pre-authorized_code'];

    if (!preAuthorizedGrant?.['pre-authorized_code']) {
      throw new CredentialOfferParseError(
        'El credential offer no contiene pre-authorized_code compatible con el flujo real preparado.',
      );
    }

    const metadata = await this.getIssuerMetadata(offer);
    const tokenEndpoint = metadata.token_endpoint;

    if (!tokenEndpoint) {
      throw new CredentialOfferParseError(
        'La metadata del issuer no expone token_endpoint y no se pudo aplicar fallback de PoC.',
      );
    }

    let response: Response;

    try {
      response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'urn:ietf:params:oauth:grant-type:pre-authorized_code',
          'pre-authorized_code': preAuthorizedGrant['pre-authorized_code'],
        }).toString(),
      });
    } catch (error) {
      throw new CredentialOfferParseError(
        'No fue posible acceder al token endpoint real. Verifica red, CORS o que el issuer sea accesible desde el dispositivo.',
        { cause: error },
      );
    }

    if (!response.ok) {
      throw new CredentialOfferParseError(
        `El token endpoint respondio con estado HTTP ${response.status}.`,
      );
    }

    const payload = await parseJsonResponse(
      response,
      'El token endpoint no devolvio un JSON valido.',
    );

    if (!isRecord(payload) || typeof payload.access_token !== 'string') {
      throw new CredentialOfferParseError(
        'La respuesta del token endpoint no incluye access_token.',
      );
    }

    return payload as TokenResponse;
  }

  async requestCredential(
    input: RequestCredentialInput,
  ): Promise<CredentialResponse> {
    if (!input.accessToken) {
      throw new CredentialOfferParseError(
        'No se puede solicitar una credencial real sin access token.',
      );
    }

    const metadata = await this.getIssuerMetadata(input.offer);

    let response: Response;

    try {
      response = await fetch(metadata.credential_endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${input.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential_configuration_id:
            input.offer.credential_configuration_ids?.[0],
          // TODO: agregar tx_code, proof of possession y formatos alternativos cuando el backend real los requiera.
        }),
      });
    } catch (error) {
      throw new CredentialOfferParseError(
        'No fue posible acceder al credential endpoint real. Verifica red, CORS o que el issuer sea accesible desde el dispositivo.',
        { cause: error },
      );
    }

    if (!response.ok) {
      throw new CredentialOfferParseError(
        `El credential endpoint respondio con estado HTTP ${response.status}.`,
      );
    }

    const payload = await parseJsonResponse(
      response,
      'El credential endpoint no devolvio un JSON valido.',
    );

    if (!isRecord(payload)) {
      throw new CredentialOfferParseError(
        'La respuesta del credential endpoint no tiene el formato esperado.',
      );
    }

    if (
      payload.credential === undefined &&
      (!Array.isArray(payload.credentials) || payload.credentials.length === 0)
    ) {
      throw new CredentialOfferParseError(
        'La respuesta del credential endpoint no contiene credential ni credentials.',
      );
    }

    return {
      ...payload,
      raw: payload,
    } as CredentialResponse;
  }
}

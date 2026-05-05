import type {
  CredentialOffer,
  ParsedCredentialOffer,
  PreAuthorizedCodeGrant,
} from '../domain/credentialOffer.types';
import { CredentialOfferParseError } from '../domain/issuanceErrors';

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isValidTxCode(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }

  if (
    value.input_mode !== undefined &&
    typeof value.input_mode !== 'string'
  ) {
    return false;
  }

  if (value.length !== undefined && typeof value.length !== 'number') {
    return false;
  }

  if (
    value.description !== undefined &&
    typeof value.description !== 'string'
  ) {
    return false;
  }

  return true;
}

function isPreAuthorizedCodeGrant(
  value: unknown,
): value is PreAuthorizedCodeGrant {
  if (!isRecord(value)) {
    return false;
  }

  if (typeof value['pre-authorized_code'] !== 'string') {
    return false;
  }

  if (value.tx_code !== undefined && !isValidTxCode(value.tx_code)) {
    return false;
  }

  return true;
}

export function ensureCredentialOffer(value: unknown): CredentialOffer {
  if (!isRecord(value)) {
    throw new CredentialOfferParseError(
      'El credential offer debe ser un objeto JSON valido.',
    );
  }

  if (typeof value.credential_issuer !== 'string') {
    throw new CredentialOfferParseError(
      'El credential offer debe incluir credential_issuer como string.',
    );
  }

  if (
    value.credential_configuration_ids !== undefined &&
    !isStringArray(value.credential_configuration_ids)
  ) {
    throw new CredentialOfferParseError(
      'credential_configuration_ids debe ser un arreglo de strings.',
    );
  }

  if (value.grants !== undefined && !isRecord(value.grants)) {
    throw new CredentialOfferParseError('grants debe ser un objeto valido.');
  }

  const preAuthorizedCode =
    isRecord(value.grants)
      ? value.grants['urn:ietf:params:oauth:grant-type:pre-authorized_code']
      : undefined;

  if (
    preAuthorizedCode !== undefined &&
    !isPreAuthorizedCodeGrant(preAuthorizedCode)
  ) {
    throw new CredentialOfferParseError(
      'El grant pre-authorized_code debe incluir "pre-authorized_code" como string.',
    );
  }

  return value as CredentialOffer;
}

function parseJsonOffer(input: string): CredentialOffer {
  try {
    const parsed: unknown = JSON.parse(input);
    return ensureCredentialOffer(parsed);
  } catch (error) {
    if (error instanceof CredentialOfferParseError) {
      throw error;
    }

    throw new CredentialOfferParseError(
      'No fue posible parsear el credential offer JSON.',
      { cause: error },
    );
  }
}

function parseUriInput(input: string): URL {
  try {
    return new URL(input);
  } catch (error) {
    throw new CredentialOfferParseError(
      'La entrada no es JSON valido ni una URI de credential offer reconocible.',
      { cause: error },
    );
  }
}

function buildPlaceholderOfferFromUri(credentialOfferUri: string): CredentialOffer {
  try {
    const url = new URL(credentialOfferUri);

    return {
      credential_issuer: url.origin,
    };
  } catch {
    return {
      credential_issuer: credentialOfferUri,
    };
  }
}

export function parseCredentialOffer(input: string): ParsedCredentialOffer {
  const trimmedInput = input.trim();

  if (!trimmedInput) {
    throw new CredentialOfferParseError(
      'Debes ingresar un credential offer en JSON o una URI valida.',
    );
  }

  if (trimmedInput.startsWith('{')) {
    return {
      sourceType: 'json',
      offer: parseJsonOffer(trimmedInput),
      rawInput: input,
    };
  }

  const url = parseUriInput(trimmedInput);
  const credentialOfferParam = url.searchParams.get('credential_offer');

  if (credentialOfferParam) {
    return {
      sourceType: 'credential_offer',
      offer: parseJsonOffer(credentialOfferParam),
      rawInput: input,
    };
  }

  const credentialOfferUri = url.searchParams.get('credential_offer_uri');

  if (credentialOfferUri) {
    return {
      sourceType: 'credential_offer_uri',
      offer: buildPlaceholderOfferFromUri(credentialOfferUri),
      rawInput: input,
      credentialOfferUri,
    };
  }

  throw new CredentialOfferParseError(
    'La URI no contiene credential_offer ni credential_offer_uri.',
  );
}

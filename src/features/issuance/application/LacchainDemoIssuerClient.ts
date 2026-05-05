import {
  AxiosError,
  create,
  type AxiosInstance,
} from 'axios';

import type {
  LacchainDemoIssuanceResult,
  LacchainDidResponse,
  LacchainVerifiableCredential,
} from '../domain/lacchainDemo.types';

type LacchainDemoIssuerClientOptions = {
  baseUrl: string;
};

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
}

function ensureBaseUrl(baseUrl: string): string {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl.trim());

  if (!normalizedBaseUrl) {
    throw new Error(
      'No se configuro EXPO_PUBLIC_LACCHAIN_DEMO_ISSUER_BASE_URL para el flujo demo LACChain.',
    );
  }

  return normalizedBaseUrl;
}

function ensureDidResponse(payload: unknown): LacchainDidResponse {
  if (!isRecord(payload) || typeof payload.did !== 'string') {
    throw new Error('La respuesta de /new-did no incluye un did valido.');
  }

  if (typeof payload.privateKey !== 'string') {
    throw new Error(
      'La respuesta de /new-did no incluye privateKey como string.',
    );
  }

  return {
    did: payload.did,
    privateKey: payload.privateKey,
  };
}

function ensureCredentialSubject(
  payload: UnknownRecord,
): LacchainVerifiableCredential['credentialSubject'] {
  if (!isRecord(payload.credentialSubject)) {
    return undefined;
  }

  return payload.credentialSubject as LacchainVerifiableCredential['credentialSubject'];
}

function ensureVerifiableCredential(
  payload: unknown,
): LacchainVerifiableCredential {
  if (!isRecord(payload)) {
    throw new Error('La respuesta de /new-vc no tiene el formato esperado.');
  }

  const credentialSubject = ensureCredentialSubject(payload);

  if (typeof payload.issuer !== 'string') {
    throw new Error('La VC emitida no incluye issuer como string.');
  }

  if (!credentialSubject || typeof credentialSubject.id !== 'string') {
    throw new Error(
      'La VC emitida no incluye credentialSubject.id como string.',
    );
  }

  if (typeof payload.id !== 'string' && !credentialSubject) {
    throw new Error(
      'La VC emitida debe incluir id o un credentialSubject valido.',
    );
  }

  return payload as LacchainVerifiableCredential;
}

function buildAxiosErrorMessage(
  error: unknown,
  endpoint: '/new-did' | '/new-vc',
): string {
  if (error instanceof AxiosError) {
    if (error.response) {
      return `${endpoint} respondio con estado HTTP ${error.response.status}.`;
    }

    if (error.code === 'ECONNABORTED') {
      return `La solicitud a ${endpoint} excedio el tiempo de espera.`;
    }

    return `No fue posible acceder a ${endpoint} del issuer demo LACChain.`;
  }

  return `No fue posible acceder a ${endpoint} del issuer demo LACChain.`;
}

export class LacchainDemoIssuerClient {
  private readonly client: AxiosInstance;

  constructor(options: LacchainDemoIssuerClientOptions) {
    const baseUrl = ensureBaseUrl(options.baseUrl);

    this.client = create({
      baseURL: baseUrl,
      timeout: 15000,
      headers: {
        Accept: 'application/json',
      },
    });
  }

  async createDid(): Promise<LacchainDidResponse> {
    let payload: unknown;

    try {
      const response = await this.client.post('/new-did');
      payload = response.data;
    } catch (error) {
      throw new Error(buildAxiosErrorMessage(error, '/new-did'), {
        cause: error,
      });
    }

    if (payload === undefined) {
      throw new Error('La respuesta de /new-did no devolvio un JSON valido.');
    }

    return ensureDidResponse(payload);
  }

  async issueVc(targetDid: string): Promise<LacchainVerifiableCredential> {
    if (!targetDid.trim()) {
      throw new Error('No se puede solicitar una VC demo sin target DID.');
    }

    let payload: unknown;

    try {
      const response = await this.client.post('/new-vc', null, {
        params: {
          targetDid,
        },
      });
      payload = response.data;
    } catch (error) {
      throw new Error(buildAxiosErrorMessage(error, '/new-vc'), {
        cause: error,
      });
    }

    if (payload === undefined) {
      throw new Error('La respuesta de /new-vc no devolvio un JSON valido.');
    }

    return ensureVerifiableCredential(payload);
  }

  async createDidAndIssueVc(): Promise<LacchainDemoIssuanceResult> {
    const didResponse = await this.createDid();

    // Este helper no expone la privateKey fuera del cliente; el flujo de la app
    // decide si la persiste en un vault separado para la PoC.
    const { did: holderDid } = didResponse;

    const vc = await this.issueVc(holderDid);

    return {
      holderDid,
      vc,
    };
  }
}

import { useCallback, useEffect, useState } from 'react';

import { ISSUANCE_MODE } from '@/src/shared/config/env';
import { saveStoredCredential } from '@/src/features/wallet/application/walletService';

import { createIssuerClient } from './createIssuerClient';
import { mapIssuedCredentialToStoredCredential } from './mapIssuedCredentialToStoredCredential';
import { normalizeCredentialResponse } from './normalizeCredentialResponse';
import type { ParsedCredentialOffer } from '../domain/credentialOffer.types';
import type { CredentialResponse } from '../domain/credentialResponse.types';
import type {
  IssuanceFlowStep,
  IssuerMetadata,
  MockCredentialResponse,
} from '../domain/issuanceFlow.types';
import type { TokenResponse } from '../domain/tokenResponse.types';

type UseMockIssuanceFlowResult = {
  step: IssuanceFlowStep;
  isIssuing: boolean;
  error: string | null;
  metadata: IssuerMetadata | null;
  tokenResponse: TokenResponse | null;
  credentialResponse: CredentialResponse | null;
  storedCredentialId: string | null;
  startMockIssuance: () => Promise<void>;
  resetFlow: () => void;
};

function isMockCredentialResponse(
  response: CredentialResponse,
): response is MockCredentialResponse {
  const candidate = response as Partial<MockCredentialResponse>;

  return (
    typeof candidate.credentialId === 'string' &&
    typeof candidate.issuer === 'string' &&
    typeof candidate.subjectId === 'string' &&
    typeof candidate.subjectName === 'string' &&
    Array.isArray(candidate.credentialType) &&
    candidate.credentialType.every((item) => typeof item === 'string') &&
    typeof candidate.issuanceDate === 'string' &&
    candidate.format === 'sd_jwt_vc' &&
    typeof candidate.credential === 'string' &&
    candidate.raw !== undefined
  );
}

const issuerClient = createIssuerClient();

export function useMockIssuanceFlow(
  parsedOffer: ParsedCredentialOffer | null,
): UseMockIssuanceFlowResult {
  const [step, setStep] = useState<IssuanceFlowStep>('idle');
  const [isIssuing, setIsIssuing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<IssuerMetadata | null>(null);
  const [tokenResponse, setTokenResponse] = useState<TokenResponse | null>(null);
  const [credentialResponse, setCredentialResponse] =
    useState<CredentialResponse | null>(null);
  const [storedCredentialId, setStoredCredentialId] = useState<string | null>(
    null,
  );

  const resetFlow = useCallback(() => {
    setStep(parsedOffer ? 'offer_parsed' : 'idle');
    setIsIssuing(false);
    setError(null);
    setMetadata(null);
    setTokenResponse(null);
    setCredentialResponse(null);
    setStoredCredentialId(null);
  }, [parsedOffer]);

  useEffect(() => {
    resetFlow();
  }, [parsedOffer, resetFlow]);

  const startMockIssuance = useCallback(async () => {
    if (!parsedOffer) {
      setError(
        'Debes procesar un credential offer antes de reclamar la credencial.',
      );
      setStep('idle');
      return;
    }

    setIsIssuing(true);
    setError(null);
    setMetadata(null);
    setTokenResponse(null);
    setCredentialResponse(null);
    setStoredCredentialId(null);
    setStep('offer_parsed');

    try {
      let effectiveOffer = parsedOffer.offer;

      if (parsedOffer.sourceType === 'credential_offer_uri') {
        if (!parsedOffer.credentialOfferUri) {
          throw new Error(
            'El credential_offer_uri escaneado o pegado no contiene una URL valida para resolverse.',
          );
        }

        if (!issuerClient.resolveCredentialOfferUri) {
          throw new Error(
            ISSUANCE_MODE === 'real'
              ? 'El modo real no pudo resolver credential_offer_uri.'
              : 'credential_offer_uri requiere resolucion HTTP y el modo mock no la implementa.',
          );
        }

        effectiveOffer = await issuerClient.resolveCredentialOfferUri(
          parsedOffer.credentialOfferUri,
        );
      }

      const nextMetadata = await issuerClient.getIssuerMetadata(effectiveOffer);
      setMetadata(nextMetadata);
      setStep('metadata_loaded');

      const nextTokenResponse = await issuerClient.requestToken(effectiveOffer);
      setTokenResponse(nextTokenResponse);
      setStep('token_received');

      const nextCredentialResponse = await issuerClient.requestCredential({
        offer: effectiveOffer,
        accessToken: nextTokenResponse.access_token,
        cNonce: nextTokenResponse.c_nonce,
      });
      setCredentialResponse(nextCredentialResponse);
      setStep('credential_received');

      const storedCredential = isMockCredentialResponse(nextCredentialResponse)
        ? mapIssuedCredentialToStoredCredential(nextCredentialResponse)
        : normalizeCredentialResponse(nextCredentialResponse, effectiveOffer);

      await saveStoredCredential(storedCredential);
      setStoredCredentialId(storedCredential.id);
      setStep('stored');
    } catch (issuanceError) {
      setStep('error');
      setError(
        issuanceError instanceof Error
          ? issuanceError.message
          : 'No fue posible completar el flujo de emision OID4VCI.',
      );
    } finally {
      setIsIssuing(false);
    }
  }, [parsedOffer]);

  return {
    step,
    isIssuing,
    error,
    metadata,
    tokenResponse,
    credentialResponse,
    storedCredentialId,
    startMockIssuance,
    resetFlow,
  };
}

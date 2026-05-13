import type { StoredCredential } from '@/src/features/wallet/domain/credential.types';

import { VerifierPresentationClient } from '../infrastructure/VerifierPresentationClient';
import type {
  VerifierPresentationQrPayload,
  VerifierPresentationResponse,
} from '../domain/verifierPresentation.types';
import { parseVerifierQrPayload } from './parseVerifierQrPayload';
import { extractVerifiableCredentialFromStoredCredential } from './extractVerifiableCredentialFromStoredCredential';

const verifierPresentationClient = new VerifierPresentationClient();

export function parseVerifierPresentationRequest(
  rawQrValue: string,
): VerifierPresentationQrPayload {
  return parseVerifierQrPayload(rawQrValue);
}

export async function submitStoredCredentialPresentation(
  request: VerifierPresentationQrPayload,
  storedCredential: StoredCredential,
): Promise<VerifierPresentationResponse> {
  const vc = extractVerifiableCredentialFromStoredCredential(storedCredential);

  return verifierPresentationClient.submitPresentation(request.callbackUrl, vc);
}

export interface VerifierPresentationQrPayload {
  type: 'VERIFIER_PRESENTATION_REQUEST_POC';
  sessionId: string;
  callbackUrl: string;
  acceptedFormat: 'w3c-vc-json';
  mode: 'HTTP_JSON_PRESENTATION_POC';
  createdAt: string;
}

export interface VerifierPresentationResponse {
  sessionId: string;
  status: 'verified' | 'failed' | 'expired';
  verificationResult?: {
    valid: boolean;
    message?: string;
    checks?: Record<string, boolean>;
    issuer?: unknown;
    claimsVerifier?: unknown;
    trustRegistry?: unknown;
    metadata?: unknown;
  };
  error?: string;
}

export interface VerifierPresentationFlowState {
  request: VerifierPresentationQrPayload | null;
  selectedCredentialId: string | null;
  result: VerifierPresentationResponse | null;
  error: string | null;
  isSubmitting: boolean;
}

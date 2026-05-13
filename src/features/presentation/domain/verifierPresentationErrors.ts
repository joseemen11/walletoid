export class VerifierPresentationError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'VerifierPresentationError';
  }
}

export class VerifierPresentationQrParseError extends VerifierPresentationError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'VerifierPresentationQrParseError';
  }
}

export class VerifiableCredentialExtractionError extends VerifierPresentationError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'VerifiableCredentialExtractionError';
  }
}

export class VerifierPresentationNetworkError extends VerifierPresentationError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'VerifierPresentationNetworkError';
  }
}

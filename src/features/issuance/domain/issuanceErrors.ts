export class CredentialOfferParseError extends Error {
  override cause?: unknown;

  constructor(message: string, options?: { cause?: unknown }) {
    super(message);
    this.name = 'CredentialOfferParseError';
    this.cause = options?.cause;
  }
}

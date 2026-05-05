export class WalletStorageError extends Error {
  override cause?: unknown;

  constructor(message: string, options?: { cause?: unknown }) {
    super(message);
    this.name = 'WalletStorageError';
    this.cause = options?.cause;
  }
}

export class CredentialNotFoundError extends Error {
  constructor(id: string) {
    super(`No se encontro la credencial con id: ${id}`);
    this.name = 'CredentialNotFoundError';
  }
}

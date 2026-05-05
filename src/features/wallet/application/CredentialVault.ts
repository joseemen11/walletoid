import type { StoredCredential } from '../domain/credential.types';

export interface CredentialVault {
  list(): Promise<StoredCredential[]>;
  get(id: string): Promise<StoredCredential | null>;
  save(credential: StoredCredential): Promise<void>;
  remove(id: string): Promise<void>;
  clear(): Promise<void>;
}

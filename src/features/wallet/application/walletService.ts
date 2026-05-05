import type { StoredCredential } from '../domain/credential.types';
import { createDemoStoredCredential } from '../domain/credentialFixtures';
import { SecureStoreCredentialVault } from '../infrastructure/SecureStoreCredentialVault';

// Mas adelante esta instancia puede reemplazarse por inyeccion de dependencias.
const credentialVault = new SecureStoreCredentialVault();

export async function listStoredCredentials(): Promise<StoredCredential[]> {
  return credentialVault.list();
}

export async function getStoredCredential(
  id: string,
): Promise<StoredCredential | null> {
  return credentialVault.get(id);
}

export async function saveStoredCredential(
  credential: StoredCredential,
): Promise<void> {
  await credentialVault.save(credential);
}

export async function removeStoredCredential(id: string): Promise<void> {
  await credentialVault.remove(id);
}

export async function clearStoredCredentials(): Promise<void> {
  await credentialVault.clear();
}

export async function seedDemoCredential(): Promise<void> {
  await saveStoredCredential(createDemoStoredCredential());
}

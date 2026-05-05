import type { HolderKeyRecord } from '../domain/holderKey.types';
import { SecureStoreHolderKeyVault } from '../infrastructure/SecureStoreHolderKeyVault';

const holderKeyVault = new SecureStoreHolderKeyVault();

export async function getHolderKeyRecord(): Promise<HolderKeyRecord | null> {
  return holderKeyVault.get();
}

export async function saveHolderKeyRecord(params: {
  did: string;
  privateKey: string;
  source: 'lacchain-demo-issuer';
}): Promise<void> {
  const existingRecord = await holderKeyVault.get();
  const now = new Date().toISOString();

  await holderKeyVault.save({
    did: params.did,
    privateKey: params.privateKey,
    source: params.source,
    createdAt: existingRecord?.createdAt ?? now,
    updatedAt: now,
  });
}

export async function clearHolderKeyRecord(): Promise<void> {
  await holderKeyVault.clear();
}

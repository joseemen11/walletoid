import * as SecureStore from 'expo-secure-store';

import type { HolderKeyVault } from '../application/HolderKeyVault';
import type { HolderKeyRecord } from '../domain/holderKey.types';
import { WalletStorageError } from '../domain/walletErrors';

const HOLDER_KEY_STORAGE_KEY = 'oid4vci-wallet-poc.holder-key.v1';

function isHolderKeyRecord(value: unknown): value is HolderKeyRecord {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.did === 'string' &&
    typeof candidate.privateKey === 'string' &&
    typeof candidate.createdAt === 'string' &&
    typeof candidate.updatedAt === 'string' &&
    candidate.source === 'lacchain-demo-issuer'
  );
}

export class SecureStoreHolderKeyVault implements HolderKeyVault {
  async get(): Promise<HolderKeyRecord | null> {
    try {
      const rawValue = await SecureStore.getItemAsync(HOLDER_KEY_STORAGE_KEY);

      if (!rawValue) {
        return null;
      }

      const parsed: unknown = JSON.parse(rawValue);

      if (!isHolderKeyRecord(parsed)) {
        throw new WalletStorageError(
          'Los datos del holder almacenados en SecureStore no tienen el formato esperado.',
        );
      }

      return parsed;
    } catch (error) {
      if (error instanceof WalletStorageError) {
        throw error;
      }

      throw new WalletStorageError(
        'No fue posible leer la llave del holder desde SecureStore.',
        { cause: error },
      );
    }
  }

  async save(record: HolderKeyRecord): Promise<void> {
    try {
      await SecureStore.setItemAsync(
        HOLDER_KEY_STORAGE_KEY,
        JSON.stringify(record),
      );
    } catch (error) {
      throw new WalletStorageError(
        'No fue posible guardar la llave del holder en SecureStore.',
        { cause: error },
      );
    }
  }

  async clear(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(HOLDER_KEY_STORAGE_KEY);
    } catch (error) {
      throw new WalletStorageError(
        'No fue posible eliminar la llave del holder almacenada en SecureStore.',
        { cause: error },
      );
    }
  }
}

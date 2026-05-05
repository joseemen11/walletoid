import * as SecureStore from 'expo-secure-store';

import type { CredentialVault } from '../application/CredentialVault';
import type { StoredCredential } from '../domain/credential.types';
import { WalletStorageError } from '../domain/walletErrors';

const WALLET_CREDENTIALS_KEY = 'oid4vci-wallet-poc.credentials.v1';

function isStoredCredentialArray(value: unknown): value is StoredCredential[] {
  return Array.isArray(value);
}

export class SecureStoreCredentialVault implements CredentialVault {
  async list(): Promise<StoredCredential[]> {
    try {
      const rawValue = await SecureStore.getItemAsync(WALLET_CREDENTIALS_KEY);

      if (!rawValue) {
        return [];
      }

      const parsed: unknown = JSON.parse(rawValue);

      if (!isStoredCredentialArray(parsed)) {
        throw new WalletStorageError(
          'Los datos almacenados en SecureStore no tienen el formato esperado.',
        );
      }

      return parsed;
    } catch (error) {
      if (error instanceof WalletStorageError) {
        throw error;
      }

      throw new WalletStorageError(
        'No fue posible leer las credenciales almacenadas en SecureStore.',
        { cause: error },
      );
    }
  }

  async get(id: string): Promise<StoredCredential | null> {
    const credentials = await this.list();

    return credentials.find((credential) => credential.id === id) ?? null;
  }

  async save(credential: StoredCredential): Promise<void> {
    const credentials = await this.list();
    const existingCredential = credentials.find((item) => item.id === credential.id);
    const now = new Date().toISOString();
    const nextCredential: StoredCredential = {
      ...credential,
      createdAt: existingCredential?.createdAt ?? credential.createdAt,
      updatedAt: now,
    };

    const nextCredentials = existingCredential
      ? credentials.map((item) =>
          item.id === credential.id ? nextCredential : item,
        )
      : [...credentials, nextCredential];

    await this.persist(nextCredentials);
  }

  async remove(id: string): Promise<void> {
    const credentials = await this.list();
    const nextCredentials = credentials.filter((credential) => credential.id !== id);

    await this.persist(nextCredentials);
  }

  async clear(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(WALLET_CREDENTIALS_KEY);
    } catch (error) {
      throw new WalletStorageError(
        'No fue posible limpiar las credenciales almacenadas en SecureStore.',
        { cause: error },
      );
    }
  }

  private async persist(credentials: StoredCredential[]): Promise<void> {
    try {
      await SecureStore.setItemAsync(
        WALLET_CREDENTIALS_KEY,
        JSON.stringify(credentials),
      );
    } catch (error) {
      throw new WalletStorageError(
        'No se pudo guardar la credencial en SecureStore. Para credenciales grandes, la PoC debe migrar a estrategia hibrida: payload cifrado en storage local y clave protegida en Keychain/Keystore.',
        { cause: error },
      );
    }
  }
}

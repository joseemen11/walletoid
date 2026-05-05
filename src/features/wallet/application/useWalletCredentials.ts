import { useCallback, useEffect, useState } from 'react';

import type { StoredCredential } from '../domain/credential.types';
import {
  clearStoredCredentials,
  listStoredCredentials,
  removeStoredCredential,
  seedDemoCredential as seedDemoCredentialInStorage,
} from './walletService';

type UseWalletCredentialsResult = {
  credentials: StoredCredential[];
  isLoading: boolean;
  error: Error | null;
  reload: () => Promise<void>;
  seedDemoCredential: () => Promise<void>;
  removeCredential: (id: string) => Promise<void>;
  clearCredentials: () => Promise<void>;
};

export function useWalletCredentials(): UseWalletCredentialsResult {
  const [credentials, setCredentials] = useState<StoredCredential[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const nextCredentials = await listStoredCredentials();
      setCredentials(nextCredentials);
    } catch (reloadError) {
      setError(
        reloadError instanceof Error
          ? reloadError
          : new Error('No fue posible cargar la wallet.'),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const seedDemoCredential = useCallback(async () => {
    setError(null);

    try {
      await seedDemoCredentialInStorage();
      await reload();
    } catch (seedError) {
      setError(
        seedError instanceof Error
          ? seedError
          : new Error('No fue posible guardar la credencial demo.'),
      );
    }
  }, [reload]);

  const removeCredential = useCallback(
    async (id: string) => {
      setError(null);

      try {
        await removeStoredCredential(id);
        await reload();
      } catch (removeError) {
        setError(
          removeError instanceof Error
            ? removeError
            : new Error('No fue posible eliminar la credencial.'),
        );
      }
    },
    [reload],
  );

  const clearCredentials = useCallback(async () => {
    setError(null);

    try {
      await clearStoredCredentials();
      await reload();
    } catch (clearError) {
      setError(
        clearError instanceof Error
          ? clearError
          : new Error('No fue posible limpiar la wallet.'),
      );
    }
  }, [reload]);

  return {
    credentials,
    isLoading,
    error,
    reload,
    seedDemoCredential,
    removeCredential,
    clearCredentials,
  };
}

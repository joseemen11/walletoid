import { useCallback, useState } from 'react';

import { saveHolderKeyRecord } from '@/src/features/wallet/application/holderKeyService';
import { saveStoredCredential } from '@/src/features/wallet/application/walletService';
import { LACCHAIN_DEMO_ISSUER_BASE_URL } from '@/src/shared/config/env';

import { LacchainDemoIssuerClient } from './LacchainDemoIssuerClient';
import { mapLacchainVcToStoredCredential } from './mapLacchainVcToStoredCredential';

type UseLacchainDemoIssuanceFlowResult = {
  isIssuing: boolean;
  error: string | null;
  holderDid: string | null;
  storedCredentialId: string | null;
  issueLacchainDemoCredential: () => Promise<void>;
  resetLacchainDemoFlow: () => void;
};

export function useLacchainDemoIssuanceFlow(): UseLacchainDemoIssuanceFlowResult {
  const [isIssuing, setIsIssuing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [holderDid, setHolderDid] = useState<string | null>(null);
  const [storedCredentialId, setStoredCredentialId] = useState<string | null>(
    null,
  );

  const resetLacchainDemoFlow = useCallback(() => {
    setIsIssuing(false);
    setError(null);
    setHolderDid(null);
    setStoredCredentialId(null);
  }, []);

  const issueLacchainDemoCredential = useCallback(async () => {
    setIsIssuing(true);
    setError(null);
    setHolderDid(null);
    setStoredCredentialId(null);

    try {
      const client = new LacchainDemoIssuerClient({
        baseUrl: LACCHAIN_DEMO_ISSUER_BASE_URL,
      });
      const holderKeyRecord = await client.createDid();

      await saveHolderKeyRecord({
        did: holderKeyRecord.did,
        privateKey: holderKeyRecord.privateKey,
        source: 'lacchain-demo-issuer',
      });

      setHolderDid(holderKeyRecord.did);

      const vc = await client.issueVc(holderKeyRecord.did);
      const result = {
        holderDid: holderKeyRecord.did,
        vc,
      };
      const storedCredential = mapLacchainVcToStoredCredential(result);

      await saveStoredCredential(storedCredential);
      setStoredCredentialId(storedCredential.id);
    } catch (issuanceError) {
      setError(
        issuanceError instanceof Error
          ? issuanceError.message
          : 'No fue posible completar la emision VC demo LACChain.',
      );
    } finally {
      setIsIssuing(false);
    }
  }, []);

  return {
    isIssuing,
    error,
    holderDid,
    storedCredentialId,
    issueLacchainDemoCredential,
    resetLacchainDemoFlow,
  };
}

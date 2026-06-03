import { BUNDLER } from '@/src/shared/config/env';
import { createSmartAccountClient } from 'permissionless';
import { createPimlicoClient } from 'permissionless/clients/pimlico';
import { createPublicClient, Hex, http } from 'viem';
import { entryPoint07Address, toCoinbaseSmartAccount } from 'viem/account-abstraction';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from "viem/chains";

const RECEIPT_WAIT_TIMEOUT_MS = 15 * 60 * 1000;
const RECEIPT_POLL_INTERVAL_MS = 2000;
const CHAIN = baseSepolia;

const isReceiptTimeoutError = (error: any)=> {
  const name = String(error?.name || '').toLowerCase();
  const message = String(error?.message || '').toLowerCase();
  return (
    name.includes('waitfortransactionreceipttimeouterror') ||
    message.includes('waitfortransactionreceipttimeouterror') ||
    message.includes('timed out while waiting for transaction')
  );
};

const waitForReceiptWithFallback = async (publicClient: any, txHash: string) => {
  try {
    return await publicClient.waitForTransactionReceipt({
      hash: txHash,
      timeout: RECEIPT_WAIT_TIMEOUT_MS,
      pollingInterval: RECEIPT_POLL_INTERVAL_MS,
    });
  } catch (error: any) {
    if (!isReceiptTimeoutError(error)) {
      throw error;
    }

    // En móvil, al volver de background el receipt puede existir aunque el wait haya vencido.
    try {
      return await publicClient.getTransactionReceipt({ hash: txHash });
    } catch {
      const timeoutError = new Error(
        `Timed out while waiting for transaction receipt for ${txHash}`,
      );
      timeoutError.name = 'WaitForTransactionReceiptTimeoutError';
      timeoutError.cause = error;
      throw timeoutError;
    }
  }
};

export async function getAccount(privateKey: Hex) {
  const owner = privateKeyToAccount(privateKey);
  const chainConfig = CHAIN;
  const bundler = BUNDLER;

  const publicClient = createPublicClient({
    chain: chainConfig,
    transport: http(bundler),
  });

  const account = await toCoinbaseSmartAccount({
    client: publicClient,
    owners: [owner],
    version: '1.1'
  });

  return {account, publicClient};
}

export async function executeOperation(
  privateKey: Hex,
  callData: any,
) {
  const chain = CHAIN;
  const bundler = BUNDLER;

  const {account, publicClient} = await getAccount(privateKey);
  
  const pimlicoClient = createPimlicoClient({
    chain,
    transport: http(bundler),
    entryPoint: {
      address: entryPoint07Address,
      version: '0.7',
    },
  });

  const smartAccountClient = createSmartAccountClient({
    account,
    chain,
    bundlerTransport: http(bundler),
    paymaster: pimlicoClient,
  });

  const txHash = await smartAccountClient.sendTransaction(callData);
  const receipt = await waitForReceiptWithFallback(publicClient, txHash);

  const block = await publicClient.getBlock({blockNumber: receipt.blockNumber});
  const date = new Date(Number(block.timestamp) * 1000);
  return {txHash, receipt, date: date.toLocaleString()};
}

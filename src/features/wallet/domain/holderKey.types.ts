export type HolderKeyRecord = {
  did: string;
  privateKey: string;
  createdAt: string;
  updatedAt: string;
  source: 'lacchain-demo-issuer';
};

export function maskPrivateKey(privateKey: string): string {
  if (privateKey.length <= 12) {
    return '********';
  }

  return `${privateKey.slice(0, 6)}...${privateKey.slice(-4)}`;
}

export function maskDid(did: string): string {
  if (did.length <= 20) {
    return did;
  }

  return `${did.slice(0, 18)}...${did.slice(-8)}`;
}

import * as SecureStore from 'expo-secure-store';

const IDENTITY_CREDENTIAL_DEMO_KEY =
  'oid4vci-wallet-poc.identity-credential-demo.v1';

// TODO POC: reemplazar este estado demo por la credencial verificable real.
// TODO POC: aquí validar si la credencial de identidad real ya existe.
// TODO POC: aquí guardar la credencial de identidad real.
export async function hasPreparedIdentityCredentialDemo(): Promise<boolean> {
  const value = await SecureStore.getItemAsync(IDENTITY_CREDENTIAL_DEMO_KEY);

  return value === 'ready';
}

export async function savePreparedIdentityCredentialDemo(): Promise<void> {
  await SecureStore.setItemAsync(IDENTITY_CREDENTIAL_DEMO_KEY, 'ready');
}

export async function clearPreparedIdentityCredentialDemo(): Promise<void> {
  await SecureStore.deleteItemAsync(IDENTITY_CREDENTIAL_DEMO_KEY);
}

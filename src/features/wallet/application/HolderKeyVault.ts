import type { HolderKeyRecord } from '../domain/holderKey.types';

export interface HolderKeyVault {
  get(): Promise<HolderKeyRecord | null>;
  save(record: HolderKeyRecord): Promise<void>;
  clear(): Promise<void>;
}

import {
  ISSUANCE_MODE,
  OID4VCI_ISSUER_BASE_URL,
} from '@/src/shared/config/env';

import type { IssuerClient } from './IssuerClient';
import { HttpOid4vciIssuerClient } from './HttpOid4vciIssuerClient';
import { MockOid4vciIssuerClient } from './MockOid4vciIssuerClient';

export function createIssuerClient(): IssuerClient {
  if (ISSUANCE_MODE === 'real') {
    return new HttpOid4vciIssuerClient({
      fallbackIssuerBaseUrl: OID4VCI_ISSUER_BASE_URL,
    });
  }

  return new MockOid4vciIssuerClient();
}

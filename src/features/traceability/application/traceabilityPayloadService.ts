import * as Crypto from 'expo-crypto';

type JsonLike =
  | string
  | number
  | boolean
  | null
  | JsonLike[]
  | { [key: string]: JsonLike | undefined };

function normalizeValue(value: unknown): JsonLike {
  if (value === null) {
    return null;
  }

  if (Array.isArray(value)) {
    return value.map(normalizeValue);
  }

  if (typeof value === 'object') {
    const source = value as Record<string, unknown>;
    return Object.keys(source)
      .sort()
      .reduce<Record<string, JsonLike>>((normalized, key) => {
        const nextValue = source[key];

        if (nextValue !== undefined) {
          normalized[key] = normalizeValue(nextValue);
        }

        return normalized;
      }, {});
  }

  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value;
  }

  return String(value);
}

export function canonicalizePayload(payload: unknown): string {
  return JSON.stringify(normalizeValue(payload));
}

export async function createDocumentHash(
  canonicalPayload: string,
): Promise<string> {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    canonicalPayload,
  );

  return `sha256:${digest}`;
}

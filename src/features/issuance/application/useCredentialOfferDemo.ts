import { useCallback, useState } from 'react';

import { parseCredentialOffer } from './parseCredentialOffer';
import { MOCK_CREDENTIAL_OFFER_JSON } from '../domain/credentialOfferFixtures';
import type { ParsedCredentialOffer } from '../domain/credentialOffer.types';

type UseCredentialOfferDemoResult = {
  input: string;
  setInput: (value: string) => void;
  parsedOffer: ParsedCredentialOffer | null;
  error: Error | null;
  parseInput: () => void;
  applyInputAndParse: (value: string) => void;
  loadMockOffer: () => void;
  clear: () => void;
};

export function useCredentialOfferDemo(): UseCredentialOfferDemoResult {
  const [input, setInput] = useState('');
  const [parsedOffer, setParsedOffer] = useState<ParsedCredentialOffer | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const parseValue = useCallback((value: string) => {
    try {
      const nextParsedOffer = parseCredentialOffer(value);
      setParsedOffer(nextParsedOffer);
      setError(null);
    } catch (parseError) {
      setParsedOffer(null);
      setError(
        parseError instanceof Error
          ? parseError
          : new Error('No fue posible procesar el credential offer.'),
      );
    }
  }, []);

  const parseInput = useCallback(() => {
    parseValue(input);
  }, [input, parseValue]);

  const applyInputAndParse = useCallback(
    (value: string) => {
      setInput(value);
      parseValue(value);
    },
    [parseValue],
  );

  const loadMockOffer = useCallback(() => {
    setInput(MOCK_CREDENTIAL_OFFER_JSON);
    setParsedOffer(null);
    setError(null);
  }, []);

  const clear = useCallback(() => {
    setInput('');
    setParsedOffer(null);
    setError(null);
  }, []);

  return {
    input,
    setInput,
    parsedOffer,
    error,
    parseInput,
    applyInputAndParse,
    loadMockOffer,
    clear,
  };
}

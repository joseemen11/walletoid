import { useCallback, useEffect, useState } from 'react';

import type { StoredCredential } from '@/src/features/wallet/domain/credential.types';

import type {
  VerifierPresentationFlowState,
  VerifierPresentationQrPayload,
  VerifierPresentationResponse,
} from '../domain/verifierPresentation.types';
import {
  parseVerifierPresentationRequest,
  submitStoredCredentialPresentation,
} from './verifierPresentationService';

type Listener = () => void;

const initialState: VerifierPresentationFlowState = {
  request: null,
  selectedCredentialId: null,
  result: null,
  error: null,
  isSubmitting: false,
};

let state: VerifierPresentationFlowState = initialState;
const listeners = new Set<Listener>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function setFlowState(
  nextState:
    | VerifierPresentationFlowState
    | ((currentState: VerifierPresentationFlowState) => VerifierPresentationFlowState),
) {
  state =
    typeof nextState === 'function'
      ? nextState(state)
      : nextState;
  emitChange();
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

type UseVerifierPresentationFlowResult = VerifierPresentationFlowState & {
  parseAndStoreRequest: (rawQrValue: string) => VerifierPresentationQrPayload;
  setRequest: (request: VerifierPresentationQrPayload) => void;
  selectCredential: (credentialId: string) => void;
  submitSelectedCredential: (
    credential: StoredCredential,
  ) => Promise<VerifierPresentationResponse | null>;
  setError: (error: string | null) => void;
  resetFlow: () => void;
};

export function useVerifierPresentationFlow(): UseVerifierPresentationFlowResult {
  const [snapshot, setSnapshot] = useState(state);

  useEffect(() => subscribe(() => setSnapshot(state)), []);

  const setRequest = useCallback((request: VerifierPresentationQrPayload) => {
    setFlowState((currentState) => ({
      ...currentState,
      request,
      selectedCredentialId: null,
      result: null,
      error: null,
      isSubmitting: false,
    }));
  }, []);

  const parseAndStoreRequest = useCallback(
    (rawQrValue: string): VerifierPresentationQrPayload => {
      const request = parseVerifierPresentationRequest(rawQrValue);
      setRequest(request);
      return request;
    },
    [setRequest],
  );

  const selectCredential = useCallback((credentialId: string) => {
    setFlowState((currentState) => ({
      ...currentState,
      selectedCredentialId: credentialId,
      error: null,
    }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setFlowState((currentState) => ({
      ...currentState,
      error,
      isSubmitting: false,
    }));
  }, []);

  const submitSelectedCredential = useCallback(
    async (
      credential: StoredCredential,
    ): Promise<VerifierPresentationResponse | null> => {
      const currentRequest = state.request;

      if (!currentRequest) {
        setError('No hay una solicitud de presentacion activa.');
        return null;
      }

      setFlowState((currentState) => ({
        ...currentState,
        error: null,
        result: null,
        isSubmitting: true,
      }));

      try {
        const result = await submitStoredCredentialPresentation(
          currentRequest,
          credential,
        );

        setFlowState((currentState) => ({
          ...currentState,
          result,
          error: null,
          isSubmitting: false,
        }));

        return result;
      } catch (submitError) {
        const message =
          submitError instanceof Error
            ? submitError.message
            : 'No se pudo conectar con el verificador. Verifica que el teléfono y la computadora estén en la misma red o usa un enlace público de prueba.';

        if (__DEV__) {
          console.error('[Presentation] Submit failed', submitError);
        }

        setFlowState((currentState) => ({
          ...currentState,
          result: null,
          error: message,
        }));

        return null;
      } finally {
        setFlowState((currentState) => ({
          ...currentState,
          isSubmitting: false,
        }));
      }
    },
    [setError],
  );

  const resetFlow = useCallback(() => {
    setFlowState(initialState);
  }, []);

  return {
    ...snapshot,
    parseAndStoreRequest,
    setRequest,
    selectCredential,
    submitSelectedCredential,
    setError,
    resetFlow,
  };
}

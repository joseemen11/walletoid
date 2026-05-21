import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { CIUDADANIA_CLIENT_ID } from '@/src/shared/config/env';

import {
  buildCiudadaniaRedirectUri,
  ciudadaniaDiscovery,
  CIUDADANIA_SCOPES,
  exchangeCiudadaniaCode,
  fetchCiudadaniaUserInfo,
  generateCiudadaniaNonce,
  type CiudadaniaTokenResponse,
  type CiudadaniaUserInfo,
} from './ciudadaniaAuthService';
import {
  clearCiudadaniaSession,
  loadCiudadaniaSession,
  saveCiudadaniaSession,
} from './ciudadaniaSessionStorage';

WebBrowser.maybeCompleteAuthSession();

type CiudadaniaLoginState = {
  login: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
  user: CiudadaniaUserInfo | null;
  tokens: CiudadaniaTokenResponse | null;
};

function getResultErrorMessage(result: AuthSession.AuthSessionResult): string {
  if (result.type === 'cancel' || result.type === 'dismiss') {
    return 'El inicio de sesion fue cancelado.';
  }

  if (result.type === 'locked') {
    return 'Ya hay un inicio de sesion en curso.';
  }

  if (result.type === 'opened') {
    return 'El navegador se abrio, pero el flujo no devolvio un codigo.';
  }

  if (result.type === 'error') {
    const description =
      result.params.error_description ||
      result.error?.description ||
      result.error?.message ||
      result.params.error ||
      'El proveedor devolvio un error durante el inicio de sesion.';

    return description;
  }

  return 'No se recibio un codigo de autorizacion.';
}

export function useCiudadaniaLogin(): CiudadaniaLoginState {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<CiudadaniaUserInfo | null>(null);
  const [tokens, setTokens] = useState<CiudadaniaTokenResponse | null>(null);
  const redirectUri = useMemo(() => buildCiudadaniaRedirectUri(), []);

  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      try {
        const session = await loadCiudadaniaSession();

        if (!mounted || !session) {
          return;
        }

        setTokens(session.tokens);
        setUser(session.user);
      } catch {
        if (mounted) {
          setError('No fue posible cargar la sesion local de Ciudadania Digital.');
        }
      }
    }

    restoreSession();

    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const nonce = await generateCiudadaniaNonce();
      const authRequest = new AuthSession.AuthRequest({
        clientId: CIUDADANIA_CLIENT_ID,
        codeChallengeMethod: AuthSession.CodeChallengeMethod.S256,
        extraParams: {
          nonce,
        },
        redirectUri,
        responseType: AuthSession.ResponseType.Code,
        scopes: CIUDADANIA_SCOPES,
        usePKCE: true,
      });
      const result = await authRequest.promptAsync(ciudadaniaDiscovery);

      if (result.type !== 'success') {
        throw new Error(getResultErrorMessage(result));
      }

      const code = result.params.code;

      if (!code) {
        throw new Error(
          'El callback de Ciudadania Digital no incluyo un codigo de autorizacion.',
        );
      }

      if (!authRequest.codeVerifier) {
        throw new Error(
          'No se encontro el code_verifier local para completar PKCE.',
        );
      }

      const nextTokens = await exchangeCiudadaniaCode({
        code,
        codeVerifier: authRequest.codeVerifier,
        redirectUri,
      });
      const nextUser = await fetchCiudadaniaUserInfo(nextTokens.access_token);

      await saveCiudadaniaSession({
        tokens: nextTokens,
        user: nextUser,
      });

      setTokens(nextTokens);
      setUser(nextUser);
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : 'No fue posible iniciar sesion con Ciudadania Digital.',
      );
    } finally {
      setLoading(false);
    }
  }, [redirectUri]);

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await clearCiudadaniaSession();
      setTokens(null);
      setUser(null);
    } catch {
      setError('No fue posible limpiar la sesion local de Ciudadania Digital.');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    login,
    logout,
    loading,
    error,
    user,
    tokens,
  };
}

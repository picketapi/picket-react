import { useState, useEffect, useCallback, ReactNode } from "react";

import Picket, {
  AuthState,
  PicketOptions,
  LoginRequest,
  LoginOptions,
  hasAuthorizationCodeParams,
  defaultLoginRedirectCallback,
} from "@picketapi/picket-js";

import { PicketContext } from "./context";

interface ProviderProps extends PicketOptions {
  children?: ReactNode;
  loginRedirectCallback?: typeof defaultLoginRedirectCallback;
  apiKey: string;
}

export const PicketProvider = ({
  children,
  apiKey,
  loginRedirectCallback = defaultLoginRedirectCallback,
  ...options
}: ProviderProps) => {
  const [picket] = useState(() => new Picket(apiKey, options));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [authState, setAuthState] = useState<AuthState>();
  const [error, setError] = useState<Error>();

  // on mount,
  // 1. check if we are in authorization code flow, if so finish the flow
  // 2. check if user is logged in
  useEffect(() => {
    (async (): Promise<void> => {
      try {
        setIsAuthenticating(true);
        const url = window.location.href;

        if (hasAuthorizationCodeParams(url)) {
          const { appState } = await picket.handleLoginRedirect(url);
          loginRedirectCallback(appState);
        }

        const auth = await picket.authState();

        // finally will still run before an early return
        if (!auth) return;

        setAuthState(auth);
        setIsAuthenticated(true);
        // clear error state
        setError(undefined);
      } catch (err) {
        setIsAuthenticated(false);
        if (err instanceof Error) {
          setError(err);
        }
      } finally {
        setIsAuthenticating(false);
      }
    })();
  }, [picket, loginRedirectCallback]);

  const login = useCallback(
    async (req?: LoginRequest, opts?: LoginOptions) => {
      try {
        setIsAuthenticating(true);
        await picket.login(req, opts);
      } catch (err) {
        setIsAuthenticated(false);
        if (err instanceof Error) {
          setError(err);
        }
      } finally {
        setIsAuthenticating(false);
      }
    },
    [picket]
  );

  const handleLoginRedirect = useCallback(
    async (url?: string) => {
      try {
        setIsAuthenticating(true);
        return await picket.handleLoginRedirect(url);
      } catch (err) {
        setIsAuthenticated(false);
        if (err instanceof Error) {
          setError(err);
        }
      } finally {
        setIsAuthenticating(false);
        // check if login was successful before returning
        const auth = await picket.authState();

        // finally will still run before an early return
        if (!auth) return;

        setAuthState(auth);
        setIsAuthenticated(true);
        // clear error state
        setError(undefined);
      }
    },
    [picket]
  );

  const getAuthorizationURL: typeof picket.getAuthorizationURL = useCallback(
    (...args) => picket.getAuthorizationURL(...args),
    [picket]
  );

  const logout = useCallback(async (): Promise<void> => {
    await picket.logout();
    setIsAuthenticated(false);
    setAuthState(undefined);
  }, [picket]);

  const connect: typeof picket.connect = useCallback(
    async (...args) => await picket.connect(...args),
    [picket]
  );

  const nonce: typeof picket.nonce = useCallback(
    async (...args) => await picket.nonce(...args),
    [picket]
  );

  const value = {
    isAuthenticating,
    isAuthenticated,
    authState,
    error,
    login,
    handleLoginRedirect,
    getAuthorizationURL,
    logout,
    connect,
    nonce,
  };

  return (
    <PicketContext.Provider value={value}>{children}</PicketContext.Provider>
  );
};

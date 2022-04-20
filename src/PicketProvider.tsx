import { useState, useEffect, useCallback, ReactNode } from "react";

import Picket, {
  AuthRequirements,
  AuthState,
  PicketOptions,
  NonceResponse,
  ConnectResponse,
  LoginRequest,
  AuthorizationURLRequest,
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

  const loginWithRedirect = useCallback(
    async (opts?: LoginRequest) => {
      setIsAuthenticating(true);
      try {
        await picket.loginWithRedirect(opts);
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
      }
    },
    [picket]
  );

  const getAuthorizationURL = useCallback(
    (opts: AuthorizationURLRequest): string => picket.getAuthorizationURL(opts),
    [picket]
  );

  const login = useCallback(
    async (opts: AuthRequirements = {}): Promise<AuthState | undefined> => {
      let resp;
      try {
        setIsAuthenticating(true);
        resp = await picket.login(opts);
        setAuthState(resp);
        setIsAuthenticated(true);
      } catch (err) {
        setIsAuthenticated(false);
        if (err instanceof Error) {
          setError(err);
        }
      } finally {
        setIsAuthenticating(false);
      }
      return resp;
    },
    [picket]
  );

  const logout = useCallback(async (): Promise<void> => {
    await picket.logout();
    setIsAuthenticated(false);
    setAuthState(undefined);
  }, [picket]);

  const connect = useCallback(
    async (): Promise<ConnectResponse> => await picket.connect(),
    [picket]
  );

  const nonce = useCallback(
    async (walletAddress: string): Promise<NonceResponse> =>
      await picket.nonce(walletAddress),
    [picket]
  );

  const value = {
    isAuthenticating,
    isAuthenticated,
    authState,
    error,
    login,
    loginWithRedirect,
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

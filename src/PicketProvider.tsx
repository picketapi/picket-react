import { useState, useEffect, useCallback, ReactNode } from "react";

import Picket, {
  AuthRequirements,
  AuthState,
  PicketOptions,
} from "@picketapi/picket-js";

import { PicketContext } from "./context";

interface ProviderProps {
  children?: ReactNode;
  apiKey: string;
  options?: PicketOptions;
}

export const PicketProvider = ({
  children,
  apiKey,
  options,
}: ProviderProps) => {
  const [picket] = useState(() => new Picket(apiKey, options));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [authState, setAuthState] = useState<AuthState>();

  // on mount, try get user data
  useEffect(() => {
    setIsAuthenticating(true);
    picket
      .authState()
      .then((data) => {
        if (!data) return;
        setAuthState(data);
        setIsAuthenticated(true);
      })
      .finally(() => setIsAuthenticating(false));
  }, [picket]);

  const login = useCallback(
    async (opts: AuthRequirements = {}): Promise<AuthState | undefined> => {
      let resp;
      try {
        setIsAuthenticating(true);
        resp = await picket.login(opts);
        setAuthState(resp);
        setIsAuthenticated(true);
      } catch (err) {
        console.error("picket: login error", err);
        setIsAuthenticated(false);
      } finally {
        setIsAuthenticating(false);
      }
      return resp;
    },
    [picket]
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await picket.logout();
      setIsAuthenticated(false);
      setAuthState(undefined);
    } catch (err) {
      console.error("picket: logout error", err);
    }
  }, [picket]);

  const value = {
    isAuthenticating,
    isAuthenticated,
    authState,
    login,
    logout,
  };

  return (
    <PicketContext.Provider value={value}>{children}</PicketContext.Provider>
  );
};

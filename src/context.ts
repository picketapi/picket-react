import { createContext } from "react";

import {
  AuthRequirements,
  AuthState,
  ConnectResponse,
  NonceResponse,
  AuthorizationURLRequest,
  LoginRequest,
  LoginCallbackResponse,
} from "@picketapi/picket-js";

export interface IPicketContext {
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  login: (opts?: AuthRequirements) => Promise<AuthState | undefined>;
  loginWithRedirect: (opts?: LoginRequest) => Promise<void>;
  handleLoginRedirect: (
    url?: string
  ) => Promise<LoginCallbackResponse | undefined>;
  getAuthorizationURL: (opts: AuthorizationURLRequest) => string;
  logout: () => Promise<void>;
  connect: () => Promise<ConnectResponse>;
  nonce: (walletAddress: string) => Promise<NonceResponse>;
  authState?: AuthState;
  error?: Error;
}

// @ts-ignore Ignore missing picket key, so we don't have to initialize here
const initialContext: IPicketContext = {
  isAuthenticating: true,
  isAuthenticated: false,
};

export const PicketContext = createContext(initialContext);
PicketContext.displayName = "PicketContext";

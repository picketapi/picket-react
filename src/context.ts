import { createContext } from "react";

import Picket, {
  AuthState,
  ConnectResponse,
  NonceResponse,
  AuthorizationURLRequest,
  LoginRequest,
  LoginOptions,
  LoginCallbackResponse,
} from "@picketapi/picket-js";

type IPicket = InstanceType<typeof Picket>;

export interface IPicketContext {
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  login: IPicket["login"];
  // handleLoginRedirect wrapper catches errors and potentially returns undefined unlike Picket class
  handleLoginRedirect: (
    url?: string
  ) => Promise<LoginCallbackResponse | undefined>;
  getAuthorizationURL: IPicket["getAuthorizationURL"];
  logout: IPicket["logout"];
  connect: IPicket["connect"];
  nonce: IPicket["nonce"];
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

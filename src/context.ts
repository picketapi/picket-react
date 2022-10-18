import React, { createContext } from "react";

import Picket, {
  AuthState,
  LoginCallbackResponse,
  LoginRequest,
  LoginOptions,
  ErrorResponse,
  AuthRequirements,
} from "@picketapi/picket-js";

type IPicket = InstanceType<typeof Picket>;

export interface IPicketContext {
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  // login wrapper catches errors and potentially returns undefined unlike Picket class
  login: (req?: LoginRequest) => Promise<AuthState | undefined>;
  loginWithRedirect: IPicket["loginWithRedirect"];
  // loginWithPopup wrapper catches errors and potentially returns undefined unlike Picket class
  loginWithPopup: (
    req?: LoginRequest,
    opts?: LoginOptions
  ) => Promise<AuthState | undefined>;
  // handleLoginRedirect wrapper catches errors and potentially returns undefined unlike Picket class
  handleLoginRedirect: (
    url?: string
  ) => Promise<LoginCallbackResponse | undefined>;
  getAuthorizationURL: IPicket["getAuthorizationURL"];
  logout: IPicket["logout"];
  connect: IPicket["connect"];
  nonce: IPicket["nonce"];
  authState?: AuthState;
  error?: Error | ErrorResponse;

  // consider making this requirements specific
  // Record<string, boolean>
  isAuthorizing: boolean;
  // isAuthorized is a wrapper around isCurrentUserAuthorized
  isAuthorized: ({
    requirements,
    revalidate,
  }: {
    requirements: AuthRequirements;
    revalidate?: boolean;
  }) => Promise<boolean>;
  // isAlreadyAuthorized is a synchronous, local only version of isAuthorized
  isAlreadyAuthorized: (requirements: AuthRequirements) => boolean;
}

// @ts-ignore Ignore missing picket key, so we don't have to initialize here
const initialContext: IPicketContext = {
  isAuthenticating: true,
  isAuthenticated: false,
  isAuthorizing: false,
};

export const PicketContext = createContext(initialContext);
PicketContext.displayName = "PicketContext";

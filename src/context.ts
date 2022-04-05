import { createContext } from "react";

import Picket, { AuthRequirements, AuthState } from "@picketapi/picket-js";

export interface IPicketContext {
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  login: (opts?: AuthRequirements) => Promise<AuthState | undefined>;
  logout: () => Promise<void>;
  authState?: AuthState;
  // TODO: Consider Error state
}

// @ts-ignore Ignore missing picket key, so we don't have to initialize here
const initialContext: IPicketContext = {
  isAuthenticating: true,
  isAuthenticated: false,
};

export const PicketContext = createContext(initialContext);
PicketContext.displayName = "PicketContext";

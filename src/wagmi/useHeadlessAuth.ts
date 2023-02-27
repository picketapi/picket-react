import React, { useState, useCallback, useEffect } from "react";

import Picket, {
  ChainType,
  AuthState,
  AuthRequirements,
} from "@picketapi/picket-js";
import { usePicket } from "../hooks";

import { useAccount, useDisconnect, useNetwork } from "wagmi";

export enum LoginStatus {
  None = "None",
  Signature = "Signature",
  Auth = "Auth",
  Success = "Success",
  Error = "Error",
}

export type HeadlessAuthProps = {
  onLogin?: (authState: AuthState) => void;
  autoLogin?: boolean;
  autoLogout?: boolean;
  requirements?: AuthRequirements;
};

export type HeadlessAuthResponse = {
  login: () => Promise<void>;
  logout: () => Promise<void>;
  status: LoginStatus;
  error: Error | null;
};

export const useHeadlessAuth = (
  {
    onLogin,
    autoLogin = false,
    autoLogout = false,
    requirements,
  }: HeadlessAuthProps = {
    autoLogin: false,
    autoLogout: false,
  }
): HeadlessAuthResponse => {
  const [status, setStatus] = useState<LoginStatus>(LoginStatus.None);
  const [error, setError] = useState<Error | null>(null);

  const {
    isAuthenticating,
    auth,
    nonce: generateNonce,
    authState,
    logout: picketLogout,
  } = usePicket();
  const user = authState?.user;

  const { isConnected, address, connector, isDisconnected, isReconnecting } =
    useAccount();
  const { disconnectAsync } = useDisconnect();
  const { chain } = useNetwork();

  const login = async () => {
    // we want to trigger login only after the user has connected their wallet
    // and user is not already logged in
    // or if the user is already logged in, but the address has changed
    if (!(isConnected && address && connector && chain)) return;
    if (isAuthenticating) return;
    if (user && user.walletAddress === address) return;

    const chainId = chain.id;
    const chainSlug = chain.network;
    let signer: any;
    let signature: string;
    let message: string;

    const domain = window.location.host;
    const uri = window.location.origin;
    const issuedAt = new Date().toISOString();

    const context = {
      domain,
      uri,
      issuedAt,
      chainId,
      // wagmi only supports ethereum
      chainType: "ethereum" as ChainType,
      locale: navigator?.language,
    };

    setStatus(LoginStatus.Signature);

    try {
      signer = await connector.getSigner({
        chainId,
      });
    } catch (err) {
      console.error(err);
      setStatus(LoginStatus.Error);
      setError(new Error("Failed to get signer. Is your wallet connected?"));
      return;
    }
    try {
      const { nonce, statement, format } = await generateNonce({
        walletAddress: address,
        chain: chainSlug,
        locale: context.locale,
      });
      message = Picket.createSigningMessage({
        nonce,
        walletAddress: address,
        statement,
        format,
        ...context,
      });
    } catch (err) {
      console.error(err);
      setStatus(LoginStatus.Error);
      setError(new Error("Failed to generate nonce. Please try again."));
      return;
    }

    try {
      signature = await signer.signMessage(message);
    } catch (err) {
      console.error(err);
      setStatus(LoginStatus.Error);
      setError(new Error("Failed to get signature"));
      return;
    }

    try {
      setStatus(LoginStatus.Auth);

      const authState = await auth({
        walletAddress: address,
        signature,
        chain: chainSlug,
        context,
        requirements,
      });

      if (!authState) {
        setStatus(LoginStatus.Error);
        setError(new Error("Failed to authenticate"));
        return;
      }

      // Success
      setStatus(LoginStatus.Success);
      if (onLogin) onLogin(authState);
    } catch (err) {
      console.error(err);
      setStatus(LoginStatus.Error);
      setError(err as Error);
      return;
    }
  };

  const loginCallback = useCallback(login, [
    isConnected,
    isAuthenticating,
    address,
    connector,
    chain,
    auth,
    generateNonce,
    user,
    onLogin,
    requirements,
  ]);

  // auto login on connect
  useEffect(() => {
    if (autoLogin && isConnected && !isAuthenticating) {
      loginCallback();
    }
  }, [loginCallback, autoLogin, isConnected, isAuthenticating]);

  const logout = async () => {
    await disconnectAsync();
    await picketLogout();
    setStatus(LoginStatus.None);
  };

  const logoutCallback = useCallback(logout, [disconnectAsync, picketLogout]);

  // logout on disconnect
  // or if the user is logged in, but the address has changed
  useEffect(() => {
    if (!autoLogout) return;
    // ingore reconnects
    if (isReconnecting) return;

    if (isDisconnected || (user && user.walletAddress !== address)) {
      logoutCallback();
      setStatus(LoginStatus.None);
    }
  }, [
    logoutCallback,
    isDisconnected,
    autoLogout,
    user,
    address,
    isReconnecting,
  ]);

  // if user is logged in, set the state as success
  useEffect(() => {
    if (user && user.walletAddress === address) {
      setStatus(LoginStatus.Success);
    }
  }, [user, address]);

  return {
    login: loginCallback,
    logout: logoutCallback,
    status,
    error,
  };
};

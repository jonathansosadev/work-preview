import React from 'react';
import * as Sentry from '@sentry/react';
import api, {getTokenFromLocalStorage, persistTokenToLocalStorage} from '../api';

const TOKEN_SEARCH_PARAM = 'user';
const REFRESH_TIMEOUT = 1500;
const MAX_RETRIES = 3;

function getUserTokenFromUrl() {
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams?.get(TOKEN_SEARCH_PARAM);
}

type ContextProps = {
  isLoading: boolean;
  isTokenValid: boolean;
};

const AuthContext = React.createContext<ContextProps>({
  isLoading: true,
  isTokenValid: true,
});

function AuthProvider(props: any) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [isTokenValid, setIsTokenValid] = React.useState(false);

  const refreshToken = React.useCallback(async (token?: string | null, retries = 0) => {
    const prevToken = token || getTokenFromLocalStorage();
    const {error, data} = await api.auth.refreshToken({
      token: prevToken,
    });

    if (data?.token) {
      persistTokenToLocalStorage(data.token);
      setIsTokenValid(true);
    }

    if (error) {
      if (retries < MAX_RETRIES) {
        const nextRetries = retries + 1;

        setTimeout(() => {
          refreshToken(token, nextRetries);
        }, REFRESH_TIMEOUT * nextRetries);
        return;
      }

      if (prevToken) {
        Sentry.captureMessage(
          `Token refresh failure on ${
            window?.location?.href
          }. Token: ${prevToken}. ${JSON.stringify(error)}. `,
          {user: {userToken: prevToken}},
        );
        Sentry.captureMessage(`Token: ${prevToken}}`);
      }

      setIsTokenValid(false);
    }
    setIsLoading(false);
  }, []);

  React.useLayoutEffect(() => {
    const userToken = getUserTokenFromUrl();
    if (userToken) {
      persistTokenToLocalStorage(userToken);
    }

    refreshToken(userToken);
  }, [refreshToken]);

  return (
    <AuthContext.Provider
      {...props}
      value={{
        isTokenValid,
        isLoading,
      }}
    />
  );
}

function useAuth(): ContextProps {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export {AuthProvider, useAuth, AuthContext};

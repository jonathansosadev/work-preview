import React from 'react';
import {useHistory} from 'react-router-dom';
import {useQueryClient} from 'react-query';
import {mixpanelReset} from '../analytics/mixpanel';
import {useStatus} from 'utils/hooks';
import api, {
  getTokenFromLocalStorage,
  persistUserTokenToLocalStorage,
  removeUserTokenFromLocalStorage,
  ResolverTypes,
  USER_TOKEN,
} from '../api';
import type {User} from '../utils/types';
import FullPageSpinner from '../components/common/FullPageSpinner';
import {resetHubspot} from '../analytics/hubspot';
import {getCurrentLocale, removeSearchParamFromUrl} from '../utils/common';

const IS_PRODUCTION_BUILD = process.env.NODE_ENV === 'production';

export function callLouFunc(user: User) {
  (window as any).LOU.identify(user.id, {
    company: user.company_name,
    // permissions: 'admin',
    // plan: 'premium',
  });
}

function patchUserLocalBasedIsAdmin(updateUserLocale: () => void) {
  const isFromAdmin = sessionStorage.getItem('developmentParam') === 'true';

  if (!isFromAdmin) {
    updateUserLocale();
  }
}

function updateUserLocale(language: string) {
  const currentLocale = getCurrentLocale();
  const isLanguageChanged = language !== currentLocale;
  const payload = {
    language: currentLocale,
  };

  if (!isLanguageChanged) {
    return;
  }

  api.users.patchMe(payload);
}

export type ContextProps = {
  accountDetails: User | null | undefined;
  logout: () => void;
  login: (token?: string, redirectToUrl?: string) => Promise<Partial<ResolverTypes>>;
  refreshAccount: () => Promise<object>;
  updateAccount: (data: any) => Promise<ResolverTypes>;
  isTokenValid: boolean;
  isLoading: boolean;
};

const AuthContext = React.createContext<ContextProps>({
  accountDetails: null,
  logout: () => {},
  login: () => Promise.resolve({}),
  refreshAccount: () => Promise.resolve({}),
  updateAccount: () => Promise.resolve({error: null, data: null}),
  isTokenValid: false,
  isLoading: false,
});

function getUserTokenFromUrl() {
  const url = new URL(window.location.href);
  return url.searchParams.get(USER_TOKEN);
}

function getAndPersistUserTokenFromUrlIfExists() {
  const userToken = getUserTokenFromUrl();

  if (userToken) {
    persistUserTokenToLocalStorage(userToken);
    removeSearchParamFromUrl(USER_TOKEN)
  }
  return userToken;
}

function AuthProvider(props: any) {
  const queryClient = useQueryClient();
  const {isLoading, setStatus} = useStatus();
  const [accountDetails, setAccountDetails] = React.useState<User | null | undefined>(
    null,
  );
  const [isPending, setIsPending] = React.useState(true);
  const [persistedToken] = React.useState(() => {
    return getTokenFromLocalStorage();
  });
  const [isTokenValid, setIsTokenValid] = React.useState(true);

  const history = useHistory();

  const userLanguage = accountDetails?.language;
  React.useLayoutEffect(() => {
    if (userLanguage) {
      patchUserLocalBasedIsAdmin(() => updateUserLocale(userLanguage));
    }
  }, [userLanguage]);

  const logout = React.useCallback(() => {
    removeUserTokenFromLocalStorage();
    setIsPending(false);
    setAccountDetails(null);
    sessionStorage.clear();
    queryClient.clear();
    localStorage.clear();
    resetHubspot();
    localStorage.removeItem('developmentParam');

    if (IS_PRODUCTION_BUILD) {
      mixpanelReset();
    }

    setIsTokenValid(false);
  }, [queryClient]);

  const fetchAndSetAccountDetails = React.useCallback(async () => {
    setStatus('loading');
    const {data, error} = await api.users.getMe();

    if (data) {
      setStatus('success');
      callLouFunc(data);
      setAccountDetails(data);
      setIsPending(false);
    }
    if (error) {
      setStatus('error');
      logout();
    }

    return {data, error};
  }, [setAccountDetails, setIsPending, logout, setStatus]);

  const login = React.useCallback(
    async (token?: string, redirectToUrl?: string) => {
      if (!token) {
        return;
      }
      persistUserTokenToLocalStorage(token);
      if (redirectToUrl) {
        history.push(redirectToUrl);
      }

      setIsPending(true);
      const result = await fetchAndSetAccountDetails();
      setIsPending(false);

      if (result.error) {
        history.goBack();
      }

      setIsTokenValid(true);
      return result;
    },
    [fetchAndSetAccountDetails, history],
  );

  const updateAccountDetails = React.useCallback(async (details: any = {}) => {
    const {data, error} = await api.users.patchMe(details);

    if (data) {
      setAccountDetails(data);
      callLouFunc(data);
    }
    return {data, error};
  }, []);

  React.useLayoutEffect(() => {
    if (persistedToken) {
      getAndPersistUserTokenFromUrlIfExists();
      fetchAndSetAccountDetails();
      return;
    }

    const token = getAndPersistUserTokenFromUrlIfExists();
    if (!token) {
      logout();
    } else {
      fetchAndSetAccountDetails();
    }
  }, [persistedToken, logout, fetchAndSetAccountDetails]);

  if (isPending) {
    return <FullPageSpinner />;
  }

  return (
    <AuthContext.Provider
      value={{
        logout,
        login,
        accountDetails,
        isTokenValid,
        refreshAccount: fetchAndSetAccountDetails,
        updateAccount: updateAccountDetails,
        isLoading,
      }}
      {...props}
    />
  );
}

function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export {AuthProvider, useAuth, AuthContext};

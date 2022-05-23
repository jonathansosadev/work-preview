import React from 'react';
import {SWRConfig} from 'swr';
import {refreshFetch} from '../utils/refreshFetch';
import i18n from '../i18n';
import {I18nextProvider} from 'react-i18next';
import {Router} from 'react-router-dom';
import {StoredURLParamsProvider} from './storedURLParams';
import {getAndHandleResponseError} from '../utils/api';
import {AuthProvider} from './auth';
import {ReservationProvider} from './reservation';
import {ComputedReservationDetailsProvider} from './computedReservationDetails';
import {WebsocketProvider} from './websocket';
import {IpDetailsProvider} from './ipDetails';

const SWR_CONFIG_VALUE = {
  fetcher: (...args: any) =>
    refreshFetch(args[0], args[1])
      .then((res: any) => res.body)
      .catch((error: any) => {
        const responseError = getAndHandleResponseError(
          error.response,
          error.body,
          args[1],
        );

        if (responseError) {
          throw responseError;
        }

        throw error.body;
      }),
  revalidateOnFocus: false,
};

type AppProvidersProps = {
  children: React.ReactNode | JSX.Element;
  browserHistory: any;
};

const defaultProps: Partial<AppProvidersProps> = {
  children: null,
};

function AppProviders({children, browserHistory}: AppProvidersProps) {
  return (
    <SWRConfig value={SWR_CONFIG_VALUE}>
      <I18nextProvider i18n={i18n}>
        <AuthProvider>
          <WebsocketProvider>
            <StoredURLParamsProvider>
              <ReservationProvider>
                <ComputedReservationDetailsProvider>
                  <IpDetailsProvider>
                    <Router history={browserHistory}>{children}</Router>
                  </IpDetailsProvider>
                </ComputedReservationDetailsProvider>
              </ReservationProvider>
            </StoredURLParamsProvider>
          </WebsocketProvider>
        </AuthProvider>
      </I18nextProvider>
    </SWRConfig>
  );
}

AppProviders.defaultProps = defaultProps;
export default AppProviders;

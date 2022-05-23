import React from 'react';
import {ReactQueryDevtools} from 'react-query/devtools';
import 'react-toastify/dist/ReactToastify.css';
import '../index.css';
import i18n from '../i18n';
import {QueryClient, QueryClientProvider} from 'react-query';
import {Router} from 'react-router-dom';
import {ToastContainer} from 'react-toastify';
import {I18nextProvider} from 'react-i18next';
import {StripeProvider} from 'react-stripe-elements';
import {AuthProvider} from './auth';
import {UserProvider} from './user';
import {ComputedDetailsProvider} from './computedDetails';
import {SubscriptionProvider} from './subscription';
import {WebsocketProvider} from './websocket';
import {OpenModalsProvider} from './openModals';
import {ContractsExportProvider} from './contractsExport';
import {TaxesExportProvider} from './taxesExport';
import {GlobalStyle} from '../styled/global';
import {resolver, ResolverData} from '../api';

const STRIPE_API_KEY = process.env.REACT_APP_STRIPE_API_KEY || '';

function resetI18nLanguage() {
  localStorage.removeItem('i18nextLng');
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({queryKey}: {queryKey: [string, any?, ResolverData?]}) => {
        const {error, data} = await resolver(...queryKey);

        if (error) {
          throw error;
        }
        return data;
      },
    },
    mutations: {
      retry: 3,
    },
  },
});

type AppProvidersProps = {
  children: React.ReactNode | JSX.Element;
  browserHistory: any;
};

const defaultProps: Partial<AppProvidersProps> = {
  children: null,
};

function AppProviders({children, browserHistory}: AppProvidersProps) {
  React.useEffect(() => {
    window.addEventListener('beforeunload', resetI18nLanguage);
    return () => {
      window.removeEventListener('beforeunload', resetI18nLanguage);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <StripeProvider apiKey={STRIPE_API_KEY}>
          <>
            <GlobalStyle />
            <Router history={browserHistory}>
              <AuthProvider>
                <UserProvider>
                  <WebsocketProvider>
                    <SubscriptionProvider>
                      <OpenModalsProvider>
                        <ComputedDetailsProvider>
                          <ContractsExportProvider>
                            <TaxesExportProvider>
                              <ToastContainer
                                newestOnTop
                                hideProgressBar
                                pauseOnFocusLoss={false}
                                icon={false}
                                autoClose={false}
                                position="bottom-right"
                              />
                              {children}
                            </TaxesExportProvider>
                          </ContractsExportProvider>
                        </ComputedDetailsProvider>
                      </OpenModalsProvider>
                    </SubscriptionProvider>
                  </WebsocketProvider>
                </UserProvider>
              </AuthProvider>
            </Router>
          </>
        </StripeProvider>
      </I18nextProvider>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}

AppProviders.defaultProps = defaultProps;
export default AppProviders;

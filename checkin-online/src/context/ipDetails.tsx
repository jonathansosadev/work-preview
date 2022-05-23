import React from 'react';
import useSWR from 'swr';
import api, {getURL} from '../api';

type ContextProps = {
  ipDetails: {
    callingCode: string;
    city: string;
    countryCapital: string;
    country_code: string;
    country_name: string;
    currency: string;
    currencySymbol: string;
    emojiFlag: string;
    flagUrl: string;
    ip: string;
    is_in_european_union: boolean;
    latitude: number;
    longitude: number;
    metro_code: number;
    organisation: string;
    region_code: string;
    region_name: string;
    suspiciousFactors: {
      isProxy: boolean;
      isTorNode: boolean;
      isSpam: boolean;
      isSuspicious: boolean;
    };
    time_zone: string;
    zip_code: string;
  } | null;
  isLoading: boolean;
};

const IpDetailsContext = React.createContext<ContextProps>({
  ipDetails: null,
  isLoading: false,
});

function IpDetailsProvider(props: any) {
  const {data, isValidating} = useSWR(getURL(api.getCountryByIp.ENDPOINTS.byIp()));

  const value: ContextProps = React.useMemo(() => {
    return {
      ipDetails: data,
      isLoading: isValidating,
    };
  }, [data, isValidating]);

  return <IpDetailsContext.Provider {...props} value={value} />;
}

function useIpDetails(): ContextProps {
  const context = React.useContext(IpDetailsContext);
  if (context === undefined) {
    throw new Error('IpDetails must be used within an IpDetailsProvider');
  }
  return context;
}

export {IpDetailsProvider, useIpDetails, IpDetailsContext};

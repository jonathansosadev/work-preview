import React from 'react';
import {useQuery} from 'react-query';
import {useTranslation} from 'react-i18next';
import api from '../api';
import {QUERY_CACHE_KEYS} from '../utils/constants';
import {useErrorToast} from '../utils/hooks';
import {District, SelectOption} from '../utils/types';

const DEFAULT_COUNTRIES_CACHE_TIME_MIN = 60;
const DEFAULT_COUNTRIES_STALE_TIME_MIN = 30;

function getCountriesAsOptions(locations: {
  results: District[];
}): SelectOption<unknown>[] {
  if (!locations?.results) {
    return [];
  }

  return locations?.results?.map((c) => {
    return {
      label: c?.country?.name,
      value: c?.country?.code,
    };
  });
}

type UseCountriesOptions = {
  enabled?: boolean;
  countriesCacheTimeMin?: number;
  countriesStaleTimeMin?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean | 'always';
  fetchOptions?: Record<string, unknown>;
};

function useCountriesOptions({
  enabled = true,
  countriesCacheTimeMin = DEFAULT_COUNTRIES_CACHE_TIME_MIN,
  countriesStaleTimeMin = DEFAULT_COUNTRIES_STALE_TIME_MIN,
  refetchOnWindowFocus = false,
  refetchOnMount = 'always',
  fetchOptions,
}: UseCountriesOptions) {
  const {t} = useTranslation();
  const {data: countries, error: countriesError, status} = useQuery(
    QUERY_CACHE_KEYS.locations,
    () => api.locations.fetchCountries(fetchOptions),
    {
      refetchOnWindowFocus,
      refetchOnMount,
      cacheTime: 1000 * 60 * countriesCacheTimeMin,
      staleTime: 1000 * 60 * countriesStaleTimeMin,
      enabled,
    },
  );
  useErrorToast(countriesError, {
    notFoundMessage: t('errors.requested_countries_not_found'),
  });

  const countriesOptions = React.useMemo(() => {
    return getCountriesAsOptions(countries);
  }, [countries]);

  return {countriesOptions, countries, status};
}

export {useCountriesOptions};

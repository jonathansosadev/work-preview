import {useQuery} from 'react-query';
import api from '../api';
import {QUERY_CACHE_KEYS} from '../utils/constants';
import {Season} from '../utils/types';

function useFetchSeason(id?: string, enabled?: boolean) {
  const {data: highSeason, isSuccess: highSeasonSuccess} = useQuery<
    Season,
    [string, string]
  >([QUERY_CACHE_KEYS.highSeason, id], () => api.seasons.fetchSeason(id!), {
    refetchOnWindowFocus: false,
    enabled: Boolean(id) && enabled,
  });

  return {highSeason, highSeasonSuccess};
}

export default useFetchSeason;

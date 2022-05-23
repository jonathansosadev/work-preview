import {useQuery} from 'react-query';
import {GuestGroup} from '../utils/types';
import {useErrorToast} from '../utils/hooks';
import api from '../api';
import {QUERY_CACHE_KEYS} from '../utils/constants';
import {useTranslation} from 'react-i18next';

type UseFetchGuestGroupOptions = {
  guestGroupId?: string;
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
};

function useFetchGuestGroup({
  guestGroupId,
  enabled = true,
  refetchOnWindowFocus = true,
}: UseFetchGuestGroupOptions) {
  const {t} = useTranslation();
  const {data, refetch, error, status} = useQuery<GuestGroup, [string, string]>(
    [QUERY_CACHE_KEYS.guestGroup, guestGroupId],
    () => api.guestGroups.fetchGuestGroup(guestGroupId!),
    {
      enabled,
      refetchOnWindowFocus,
    },
  );
  useErrorToast(error, {
    notFoundMessage: t('errors.requested_guest_group_not_found'),
  });

  return {data, status, error, refetch};
}

export default useFetchGuestGroup;

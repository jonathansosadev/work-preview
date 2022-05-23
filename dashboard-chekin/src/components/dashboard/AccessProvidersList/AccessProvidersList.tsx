import React from 'react';
import {Content, Header, AccessProvidersWrapper, AccessProviderContent} from './styled';
import {useQuery} from 'react-query';
import i18n from '../../../i18n';
import api, {queryFetcher} from '../../../api';
import alikesIcon from '../../../assets/akiles-logo.png';
import keycafeIcon from '../../../assets/keycafe-logo.png';
import keynestIcon from '../../../assets/keynest-logo.png';
import nukiIcon from '../../../assets/nuki-logo.png';
import omnitecIcon from '../../../assets/omnitec-logo.svg';
import homeitIcon from '../../../assets/homeit-logo.png';
import remotelockIcon from '../../../assets/remotelock-logo.png';
import yacanIcon from '../../../assets/yacan-logo.svg';
import mondiseIcon from '../../../assets/logo-mondise.png';
import saltoIcon from '../../../assets/logo-salto.svg';
import ttlockIcon from '../../../assets/logo-ttlock.png';
import aleaIcon from '../../../assets/logo-alea.png';
import {useTranslation} from 'react-i18next';
import {useErrorToast} from '../../../utils/hooks';
import MarketplaceItem from '../MarketplaceItem';
import {
  MARKETPLACE_TYPES,
  MARKETPLACE_STATUSES,
  LOCK_VENDOR_OPTIONS,
  LOCK_VENDORS,
} from '../../../utils/constants';
import {AccessProvider, LockUser} from '../../../utils/types';

function fetchLockUsers() {
  return queryFetcher(api.users.ENDPOINTS.lockUsers(``));
}

const INITIAL_ACCESS_PROVIDERS: Array<AccessProvider> = [
  {
    type: MARKETPLACE_TYPES.access_provider,
    logoSrc: alikesIcon,
    descriptionText: i18n.t('smart_lock_system_connected'),
    status: MARKETPLACE_STATUSES.unconnected,
    name: LOCK_VENDOR_OPTIONS[LOCK_VENDORS.akiles]?.label,
  },
  {
    type: MARKETPLACE_TYPES.access_provider,
    logoSrc: keycafeIcon,
    descriptionText: i18n.t('key_management_system_with'),
    status: MARKETPLACE_STATUSES.unconnected,
    name: LOCK_VENDOR_OPTIONS[LOCK_VENDORS.keycafe]?.label,
  },
  {
    type: MARKETPLACE_TYPES.access_provider,
    logoSrc: keynestIcon,
    descriptionText: i18n.t('simple_and_secure_key_exchange'),
    status: MARKETPLACE_STATUSES.unconnected,
    name: LOCK_VENDOR_OPTIONS[LOCK_VENDORS.keynest]?.label,
  },
  {
    type: MARKETPLACE_TYPES.access_provider,
    logoSrc: nukiIcon,
    descriptionText: i18n.t('nuki_keyless_access'),
    status: MARKETPLACE_STATUSES.unconnected,
    name: LOCK_VENDOR_OPTIONS[LOCK_VENDORS.nuki]?.label,
  },
  {
    type: MARKETPLACE_TYPES.access_provider,
    logoSrc: omnitecIcon,
    descriptionText: i18n.t('remote_access_to_the_property'),
    status: MARKETPLACE_STATUSES.unconnected,
    name: LOCK_VENDOR_OPTIONS[LOCK_VENDORS.omnitec]?.label,
  },
  {
    type: MARKETPLACE_TYPES.access_provider,
    logoSrc: homeitIcon,
    descriptionText: i18n.t('a_multi_sided_platform'),
    status: MARKETPLACE_STATUSES.unconnected,
    name: LOCK_VENDOR_OPTIONS[LOCK_VENDORS.homeit].label,
  },
  {
    type: MARKETPLACE_TYPES.access_provider,
    logoSrc: remotelockIcon,
    descriptionText: i18n.t('remotelock_sets'),
    status: MARKETPLACE_STATUSES.unconnected,
    name: LOCK_VENDOR_OPTIONS[LOCK_VENDORS.remotelock].label,
  },
  {
    type: MARKETPLACE_TYPES.access_provider,
    logoSrc: yacanIcon,
    descriptionText: i18n.t('yacan_short_description'),
    status: MARKETPLACE_STATUSES.unconnected,
    name: LOCK_VENDOR_OPTIONS[LOCK_VENDORS.yacan].label,
  },
  {
    type: MARKETPLACE_TYPES.access_provider,
    logoSrc: mondiseIcon,
    descriptionText: i18n.t('mondise_short_description'),
    status: MARKETPLACE_STATUSES.unconnected,
    name: LOCK_VENDOR_OPTIONS[LOCK_VENDORS.mondise].label,
  },
  {
    type: MARKETPLACE_TYPES.access_provider,
    logoSrc: saltoIcon,
    descriptionText: i18n.t('salto_short_description'),
    status: MARKETPLACE_STATUSES.unconnected,
    name: LOCK_VENDOR_OPTIONS[LOCK_VENDORS.salto].label,
  },
  {
    type: MARKETPLACE_TYPES.access_provider,
    logoSrc: ttlockIcon,
    descriptionText: i18n.t('ttlock_short_description'),
    status: MARKETPLACE_STATUSES.unconnected,
    name: 'TTlock',
  },
  {
    type: MARKETPLACE_TYPES.access_provider,
    logoSrc: aleaIcon,
    descriptionText: i18n.t('elea_short_description'),
    status: MARKETPLACE_STATUSES.unconnected,
    name: LOCK_VENDOR_OPTIONS[LOCK_VENDORS.elea].label,
  },
];

function AccessProvidersList() {
  const {t} = useTranslation();
  const [userAccessProviders, setUserAccessProviders] = React.useState(
    INITIAL_ACCESS_PROVIDERS,
  );
  const {data: fetchedLockUsers, error: fetchedLockUsersError, status} = useQuery(
    'lockUsers',
    fetchLockUsers,
    {
      refetchOnWindowFocus: false,
    },
  );
  useErrorToast(fetchedLockUsersError, {
    notFoundMessage: 'Requested invoices could not be found. Please contact support.',
  });

  React.useEffect(
    function updateUserAccessProvidersIfNeeded() {
      if (status === 'success') {
        let newUserAccessProviders = INITIAL_ACCESS_PROVIDERS.map((accessProvider) => {
          const connectedUserProvider = fetchedLockUsers.find((lockUser: LockUser) => {
            return (
              LOCK_VENDOR_OPTIONS[lockUser.vendor as keyof typeof LOCK_VENDOR_OPTIONS]
                ?.label === accessProvider.name
            );
          });

          if (connectedUserProvider) {
            return {
              ...accessProvider,
              status: MARKETPLACE_STATUSES.connected,
              id: connectedUserProvider.id,
            };
          }
          return accessProvider;
        });
        setUserAccessProviders(newUserAccessProviders);
      }
    },
    [status, fetchedLockUsers],
  );

  return (
    <Content>
      <Header>
        {t('marketplace')} - {t('access_provider')}
      </Header>
      <AccessProvidersWrapper>
        {userAccessProviders.map((accessProvider) => {
          return (
            <AccessProviderContent key={accessProvider.name}>
              <MarketplaceItem
                name={accessProvider.name}
                status={accessProvider.status}
                type={accessProvider.type}
                logoSrc={accessProvider.logoSrc}
                descriptionText={accessProvider.descriptionText}
                id={accessProvider.id}
              />
            </AccessProviderContent>
          );
        })}
      </AccessProvidersWrapper>
    </Content>
  );
}

export {AccessProvidersList};

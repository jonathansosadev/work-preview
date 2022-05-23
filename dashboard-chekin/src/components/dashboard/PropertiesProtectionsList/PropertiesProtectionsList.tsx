import React from 'react';
import { Content, Header, AccessProvidersWrapper, AccessProviderContent } from './styled';
import { useQuery } from 'react-query';
import i18n from '../../../i18n';
import api, { queryFetcher } from '../../../api';
import superHogLogo from '../../../assets/superhog-logo.png';
import { useTranslation } from 'react-i18next';
import { useErrorToast } from '../../../utils/hooks';
import MarketplaceItem from '../MarketplaceItem';
import {
  MARKETPLACE_TYPES,
  MARKETPLACE_STATUSES,
} from '../../../utils/constants';
import { PropertieConection, SuperHogChekinHousing, SuperHogHousing } from '../../../utils/types';
import { useUser } from 'context/user';
// import { toast } from 'react-toastify';

function fetchSuperHogChekinHousings() {
  return queryFetcher(api.propertiesProtections.ENDPOINTS.mapHousings());
}

const INITIAL_PROPERTIES_PROTECTIONS: Array<PropertieConection> = [
  {
    type: MARKETPLACE_TYPES.property_protection,
    logoSrc: superHogLogo,
    descriptionText: i18n.t('super_hog_list_item_description'),
    status: MARKETPLACE_STATUSES.unconnected,
    name: 'superhog',
  },

];


function PropertiesProtectionsList() {
  const { t } = useTranslation();
  const user = useUser();
  const [userPropertiesProtectons, setUserPropertiesProtectons] = React.useState(
    INITIAL_PROPERTIES_PROTECTIONS,
  );

  const [listings, setListings] = React.useState<SuperHogHousing[]>([]);

  const {
    data: superHogChekinHousings,
    error: SuperHogChekinHousingsError,
  } = useQuery<SuperHogChekinHousing[]>('SuperHogChekinHousings', fetchSuperHogChekinHousings);
  useErrorToast(SuperHogChekinHousingsError, {
    notFoundMessage:
      'Requested Super Hog Housing could not be found. Please contact support.',
  });

  React.useEffect(()=>{
    const getListing = async (coreId: string) => {

      const { data } = await api.propertiesProtections.getlistings(coreId);
      if (data) {
        setListings(data);
      }
    }

    const getUser = async (coreId:string)  => {
      const {data} =  await api.propertiesProtections.getUser(coreId);

      // if (error) {
      //   if (error.message.includes('404')) {
      //     toast.error(t('error_conecting_superhog'));
      //   } 
      //   return;
      // }
      if (data) {
        const superHogConnection = INITIAL_PROPERTIES_PROTECTIONS[0];
        if (data.core_id) {
          getListing(data.core_id);
        }
        superHogConnection.status = MARKETPLACE_STATUSES.connected
        superHogConnection.id = data.id;
        setUserPropertiesProtectons([superHogConnection]);
      }
    }
    if (user) {
      getUser(user.id)
    }
  }, [user])
  // React.useEffect(() => {

  //   const getListing = async (coreId: string) => {

  //     const { data } = await api.propertiesProtections.getlistings(coreId);
  //     if (data) {
  //       setListings(data);
  //     }
  //   }
  //   if (status === 'success') {
  //     const superHogConnection = INITIAL_PROPERTIES_PROTECTIONS[0];

  //     if (data.length > 0) {
  //       if (data[0].core_id) {
  //         getListing(data[0].core_id);
  //       }
  //       superHogConnection.status = MARKETPLACE_STATUSES.connected
  //       superHogConnection.id = data[0].id;
  //       setUserPropertiesProtectons([superHogConnection]);
  //     }
  //   }
  // }, [status, data]);
  
  return (
    <Content>
      <Header>{t('marketplace')}</Header>
      <AccessProvidersWrapper>
        {userPropertiesProtectons.map((propertyProtection) => {
          return (
            <AccessProviderContent key={propertyProtection.name}>
              <MarketplaceItem
                name={propertyProtection.name}
                status={propertyProtection.status}
                type={propertyProtection.type}
                logoSrc={propertyProtection.logoSrc}
                descriptionText={propertyProtection.descriptionText}
                id={propertyProtection.id}
                superHogHousings={listings}
                superHogChekinHousings={superHogChekinHousings}
              />
            </AccessProviderContent>
          );
        })}
      </AccessProvidersWrapper>

    </Content>
  );
}

export { PropertiesProtectionsList };

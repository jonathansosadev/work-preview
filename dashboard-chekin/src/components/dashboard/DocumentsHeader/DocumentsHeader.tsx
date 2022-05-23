import React from 'react';
import {useLocation} from 'react-router-dom';
import api, {queryFetcher} from '../../../api';
import {Container, Item, ItemWrapper} from './styled';
import {useQuery} from 'react-query';
import {useTranslation} from 'react-i18next';
import {ShortHousing} from '../../../utils/types';
import {COUNTRY_CODES, STAT_ACCOUNTS_TYPES} from '../../../utils/constants';
import {getCountryCode, fetchShortHousings} from '../../../utils/housing';

const ALLOGGIATTI_COUNTRIES = [COUNTRY_CODES.italy];
const POLICE_TYPE_MOS = 'MOS';

function fetchMossosAccounts() {
  return queryFetcher(api.policeAccount.ENDPOINTS.checkIsPoliceHasType(POLICE_TYPE_MOS));
}

function fetchIdev() {
  return queryFetcher(api.statAccount.ENDPOINTS.hasType(STAT_ACCOUNTS_TYPES.IDEV));
}

function getIsAlloggiatiDocsLinkVisible(housings?: ShortHousing[]) {
  if (!housings?.length) {
    return false;
  }

  return housings.some((h) => {
    const housingCountry = getCountryCode(h);
    return ALLOGGIATTI_COUNTRIES.includes(housingCountry);
  });
}

function DocumentsHeader() {
  const {t} = useTranslation();
  const location = useLocation();
  const [isAlloggiatiLinkVisible, setIsAlloggiatiLinkVisible] = React.useState(false);
  const [isMossosLinkVisible, setIsMossosLinkVisible] = React.useState(false);

  const {data: shortHousings} = useQuery('shortHousings', fetchShortHousings);
  const {data: mossosPolice} = useQuery('mossosPolice', fetchMossosAccounts);
  const {data: hasIdevType} = useQuery('idev', fetchIdev);

  React.useLayoutEffect(() => {
    const isAllogiatiVisible = getIsAlloggiatiDocsLinkVisible(shortHousings);
    const isMossosVisible = mossosPolice?.result;

    setIsAlloggiatiLinkVisible(isAllogiatiVisible);
    setIsMossosLinkVisible(isMossosVisible);
  }, [shortHousings, mossosPolice]);

  const links = React.useMemo(
    () => [
      {
        to: '/documents/entry-form',
        label: t('entry_form'),
        visible: true,
      },
      {
        to: '/documents/contracts',
        label: t('contracts'),
        visible: true,
      },
      {
        to: '/documents/alloggiati',
        label: 'Alloggiati',
        visible: isAlloggiatiLinkVisible,
      },
      {
        to: '/documents/mossos',
        label: 'Mossos',
        visible: isMossosLinkVisible,
      },
      {
        to: '/documents/idev',
        label: 'IDEV',
        visible: hasIdevType?.result,
      },
    ],
    [t, isAlloggiatiLinkVisible, isMossosLinkVisible, hasIdevType],
  );

  return (
    <Container>
      {links.map((link) => {
        if (!link.visible) {
          return null;
        }

        return (
          <ItemWrapper key={link.to} active={location.pathname.includes(link.to)}>
            <Item to={link.to}>{link.label}</Item>
          </ItemWrapper>
        );
      })}
    </Container>
  );
}

export {DocumentsHeader};

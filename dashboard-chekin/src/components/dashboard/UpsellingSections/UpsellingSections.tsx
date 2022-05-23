import React from 'react';
import {useQuery} from 'react-query';
import {useTranslation} from 'react-i18next';
import {Switch, Route, Redirect} from 'react-router-dom';
import api from 'api';
import {useSessionStorageState} from '../../../hooks/useSessionStorageState';
import {SelectOption} from '../../../utils/types';
import {Offer} from '../../../utils/upselling/types';
import {UPSELLING_LINKS} from '../../../utils/links';
import {useUser} from '../../../context/user';
import offersIcon from 'assets/offers-inactive-icon.svg';
import offersActiveIcon from 'assets/offers-active-icon.svg';
import reportsIcon from 'assets/reports-inactive-icon.svg';
import reportsActiveIcon from 'assets/reports-active-icon.svg';
import suppliersIcon from 'assets/suppliers-icon.svg';
import suppliersActiveIcon from 'assets/suppliers-active-icon.svg';
import UpsellingHeader from '../UpsellingHeader';
import SidebarLayout from '../SidebarLayout';
import Sidebar from '../Sidebar';
import UpsellingAboutSection from '../UpsellingAboutSection';
import MyOffersSection from '../MyOffersSection';
import DealsStatusSection from '../DealsStatusSection';
import SuppliersSection from '../SuppliersSection';
import OfferDetails from '../OfferDetails';
import ReportsSection from '../ReportsSection';
import {SidebarLink} from '../Sidebar/Sidebar';
import {SidebarIcon} from 'styled/common';
import {OffersIcon, SidebarBottomArea} from './styled';

function UpsellingSections() {
  const {t} = useTranslation();
  const user = useUser();
  const isAboutUpsellingPageShown = user?.want_see_upselling_instructions;
  const [title, setTitle] = React.useState('');
  const [backLink, setBackLink] = React.useState('');
  const [housingFilter, setHousingFilter] = useSessionStorageState<SelectOption>(
    'upsellingHousingFilter',
  );

  const queryKey = api.upselling.ENDPOINTS.deals();
  const {data: offers} = useQuery<Offer[]>(queryKey);

  const redirectLink = React.useMemo(() => {
    if (isAboutUpsellingPageShown) return UPSELLING_LINKS.about;
    if (offers?.length) return UPSELLING_LINKS.offersStatus;
    return UPSELLING_LINKS.offersList;
  }, [isAboutUpsellingPageShown, offers]);

  const links: SidebarLink[] = React.useMemo(() => {
    return [
      {
        name: t('deals_and_experiences'),
        to: UPSELLING_LINKS.offersStatus,
        icon: (active) => <OffersIcon src={active ? offersActiveIcon : offersIcon} />,
        nested: [
          {
            to: UPSELLING_LINKS.offersStatus,
            name: t('deals_status'),
          },
          {
            to: UPSELLING_LINKS.offersList,
            name: t('my_deals'),
            exact: false,
            extraActiveURLs: [UPSELLING_LINKS.offersDetails],
          },
        ],
      },
      {
        name: t('reports'),
        to: UPSELLING_LINKS.reports,
        icon: (active) => <SidebarIcon src={active ? reportsActiveIcon : reportsIcon} />,
      },
      {
        name: t('suppliers'),
        to: UPSELLING_LINKS.suppliers,
        icon: (active) => (
          <SidebarIcon src={active ? suppliersActiveIcon : suppliersIcon} />
        ),
      },
    ];
  }, [t]);

  return (
    <SidebarLayout
      sidebar={
        <div>
          <Sidebar links={links} />
          <SidebarBottomArea>
          </SidebarBottomArea>
        </div>
      }
      header={
        <UpsellingHeader
          title={title}
          housingFilter={housingFilter}
          setHousingFilter={setHousingFilter}
        />
      }
      navBackLinkTo={backLink}
    >
      <Switch>
        <Route path={UPSELLING_LINKS.about}>
          <UpsellingAboutSection />
        </Route>
        <Route path={`${UPSELLING_LINKS.offersList}/:filter?`}>
          <MyOffersSection housingFilter={housingFilter} />
        </Route>
        <Route path={`${UPSELLING_LINKS.offersStatus}/:filter?`}>
          <DealsStatusSection housingFilter={housingFilter} />
        </Route>
        <Route path={`${UPSELLING_LINKS.offersDetails}/:id?`}>
          <OfferDetails setHeaderBackLink={setBackLink} setHeaderTitle={setTitle} />
        </Route>
        <Route path={UPSELLING_LINKS.suppliers}>
          <SuppliersSection />
        </Route>
        <Route path={UPSELLING_LINKS.reports}>
          <ReportsSection housingFilter={housingFilter} />
        </Route>
        <Redirect to={redirectLink} />
      </Switch>
    </SidebarLayout>
  );
}

export {UpsellingSections};

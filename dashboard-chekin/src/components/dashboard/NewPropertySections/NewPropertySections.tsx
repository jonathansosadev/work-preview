import React from 'react';
import {Route, Switch} from 'react-router-dom';
import {useQueryClient} from 'react-query';
import api from 'api';
import {useUser} from 'context/user';
import {usePrefetchSendingSettings} from 'hooks/usePrefetch';
import {useTranslation} from 'react-i18next';
import propertyInfoActiveIcon from 'assets/propertyinfo-icon-active.svg';
import checkinDeactivateIcon from 'assets/online-check-icon-inactive.svg';
import legalDeactivateIcon from 'assets/legal-icon-inactive.svg';
import identityDeactivateIcon from 'assets/iver-icon-inactive.svg';
import upsellingDeactivateIcon from 'assets/upselling-icon-inactive.svg';
import paymentsDeactivateIcon from 'assets/payments-icon-inactive.svg';
import depositsDeactivateIcon from 'assets/deposits-icon-inactive.svg';
import taxesDeactivateIcon from 'assets/taxes-icon-inactive.svg';
import remoteDeactivateIcon from 'assets/remoteacc-icon-inactive.svg';
import icalsDeactivateIcon from 'assets/monthly-calendar.svg';
import AddPropertyInfoSection from '../AddPropertyInfoSection';
import AddCheckinOnlineSection from '../AddCheckinOnlineSection';
import AddLegalSection from '../AddLegalSection';
import AddIdentityVerificationSection from '../AddIdentityVerificationSection';
import AddUpsellingSection from '../AddUpsellingSection';
import AddPaymentsSection from '../AddPaymentsSection';
import AddDepositSection from '../AddDepositSection';
import AddTaxesSection from '../AddTaxesSection';
import AddRemoteAccessSection from '../AddRemoteAccessSection';
import AddICalsSection from '../AddICalsSection';
import SidebarLayout from '../SidebarLayout';
import Sidebar from '../Sidebar';
import {SidebarLink} from '../Sidebar/Sidebar';
import {SidebarIcon} from '../../../styled/common';
import {Heading} from './styled';

export enum NEW_PROPERTIES_LINKS {
  details = '/new-properties/details',
  customFormsHub = '/new-properties/online-checkin/custom-forms',
  paymentSettings = '/new-properties/payment-settings',
  billing = '/new-properties/billing',
  communications = '/new-properties/communications',
  newCustomEmail = '/new-properties/communications/new-custom-email',
  editCustomEmail = '/new-properties/communications/:id',
  team = '/new-properties/team',
  customForm = '/new-properties/online-checkin/custom-forms/:id',
  newCustomForm = '/new-properties/online-checkin/custom-forms/new',
  onlineCheckin = '/new-properties/online-checkin/',
  customField = '/new-properties/online-checkin/custom-forms/:reservationId/custom-field',
  editCustomField = '/new-properties/online-checkin/custom-forms/:reservationId/custom-field/:id',
  
  propertyInfo = '/new-properties/property-info',
  onlineCheckIn = '/new-properties/online-check-in',
  legal = '/new-properties/legal',
  identityVerification = '/new-properties/identity-verification',
  upselling = '/new-properties/upselling',
  payments = '/new-properties/payments',
  deposits = '/new-properties/deposits',
  taxes = '/new-properties/taxes',
  remoteAccess = '/new-properties/remote-access',
  icals = '/new-properties/icals',
}

function NewPropertySections() {
  const {t} = useTranslation();
  const queryClient = useQueryClient();
  const user = useUser();
  const sendingSettingsId = user?.checkin_online_sending_settings_id;

  const accountLinks: SidebarLink[] = React.useMemo(() => {
    return [
      {
        to: NEW_PROPERTIES_LINKS.propertyInfo,
        name: t('property_info'),
        icon: (active) => <SidebarIcon src={active ? propertyInfoActiveIcon : propertyInfoActiveIcon} />,
      },
      {
        to: NEW_PROPERTIES_LINKS.onlineCheckIn,
        name: t('online_check'),
        icon: (active) => <SidebarIcon src={active ? checkinDeactivateIcon : checkinDeactivateIcon} />,
      },
      {
        to: NEW_PROPERTIES_LINKS.legal,
        name: t('legal'),
        icon: (active) => <SidebarIcon src={active ? legalDeactivateIcon : legalDeactivateIcon} />,
      },
      {
        to: NEW_PROPERTIES_LINKS.identityVerification,
        name: t('identity_sidebar'),
        icon: (active) => <SidebarIcon src={active ? identityDeactivateIcon : identityDeactivateIcon} />,
      },
      {
        to: NEW_PROPERTIES_LINKS.upselling,
        name: t('upselling_sidebar'),
        icon: (active) => <SidebarIcon src={active ? upsellingDeactivateIcon : upsellingDeactivateIcon} />,
      },
      {
        to: NEW_PROPERTIES_LINKS.payments,
        name: t('payments_sidebar'),
        icon: (active) => <SidebarIcon src={active ? paymentsDeactivateIcon : paymentsDeactivateIcon} />,
      },
      {
        to: NEW_PROPERTIES_LINKS.deposits,
        name: t('deposits'),
        icon: (active) => <SidebarIcon src={active ? depositsDeactivateIcon : depositsDeactivateIcon} />,
      },
      {
        to: NEW_PROPERTIES_LINKS.taxes,
        name: t('taxes_sidebar'),
        icon: (active) => <SidebarIcon src={active ? taxesDeactivateIcon : taxesDeactivateIcon} />,
      },
      {
        to: NEW_PROPERTIES_LINKS.remoteAccess,
        name: t('remote_access_sidebar'),
        icon: (active) => <SidebarIcon src={active ? remoteDeactivateIcon : remoteDeactivateIcon} />,
      },
      {
        to: NEW_PROPERTIES_LINKS.icals,
        name: t('icals'),
        icon: (active) => <SidebarIcon src={active ? icalsDeactivateIcon : icalsDeactivateIcon} />,
      },
    ];
  }, [t]);

  const memoizedSidebar = React.useMemo(() => {
    return <Sidebar links={accountLinks} />;
  }, [accountLinks]);

  usePrefetchSendingSettings(sendingSettingsId);

  React.useEffect(
    function prefetchData() {
      queryClient.prefetchQuery('customEmails', api.customEmails.fetchCustomEmails);
      queryClient.invalidateQueries('shortHousings');
    },
    [queryClient],
  );

  return (
    <SidebarLayout header={<Heading>{"Property name"}</Heading>} sidebar={memoizedSidebar}>
      <Switch>
        <Route exact path={NEW_PROPERTIES_LINKS.propertyInfo}>
        <AddPropertyInfoSection />
        </Route>
        <Route exact path={NEW_PROPERTIES_LINKS.onlineCheckIn}>
          <AddCheckinOnlineSection />
        </Route>
        <Route exact path={NEW_PROPERTIES_LINKS.legal}>
          <AddLegalSection />
        </Route>
        <Route exact path={NEW_PROPERTIES_LINKS.identityVerification}>
          <AddIdentityVerificationSection />
        </Route>
        <Route exact path={NEW_PROPERTIES_LINKS.upselling}>
          <AddUpsellingSection />
        </Route>
        <Route exact path={NEW_PROPERTIES_LINKS.payments}>
          <AddPaymentsSection />
        </Route>
        <Route exact path={NEW_PROPERTIES_LINKS.deposits}>
          <AddDepositSection />
        </Route>
        <Route exact path={NEW_PROPERTIES_LINKS.taxes}>
          <AddTaxesSection />
        </Route>
        <Route exact path={NEW_PROPERTIES_LINKS.remoteAccess}>
          <AddRemoteAccessSection />
        </Route>
        <Route exact path={NEW_PROPERTIES_LINKS.icals}>
          <AddICalsSection />
        </Route>
      </Switch>
    </SidebarLayout>
  );
}

export {NewPropertySections};

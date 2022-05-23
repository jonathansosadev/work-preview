import React from 'react';
import {Route, Switch} from 'react-router-dom';
import {useQueryClient} from 'react-query';
import api from 'api';
import {useUser} from 'context/user';
import {usePrefetchSendingSettings} from 'hooks/usePrefetch';
import {useTranslation} from 'react-i18next';
import accountIcon from 'assets/account-details-icon.svg';
import accountActiveIcon from 'assets/account-details-active-icon.svg';
import guestRegIcon from 'assets/guest-reg-account-icon.svg';
import paymentsIcon from 'assets/payments-account-icon.svg';
import guestRegActiveIcon from 'assets/guest-reg-account-active-icon.svg';
import paymentsActiveIcon from 'assets/payments-account-active-icon.svg';
import billingIcon from 'assets/billing-account-icon.svg';
import billingActiveIcon from 'assets/billing-account-active-icon.svg';
import communicationsIcon from 'assets/comm-icon.svg';
import communicationsActiveIcon from 'assets/comm-active-icon.svg';
import teamIcon from 'assets/team-account-icon.svg';
import teamActiveIcon from 'assets/team-account-active-icon.svg';
import customContractsIcon from 'assets/custom-contracts-icon.svg';
import customContractsActiveIcon from 'assets/custom-contracts-active-icon.svg';
import {useComputedDetails} from '../../../context/computedDetails';
import AccountDetailsSection from '../AccountDetailsSection';
import AccountTeamSection from '../AccountTeamSection';
import InviteUserTeam from '../InviteUserTeam';
import EditUserTeam from '../EditUserTeam';
import BillingSections from '../BillingSections';
import CommunicationSection from '../CommunicationSection';
import OnlineCheckinSection from '../OnlineCheckinSection';
import AccountPayments from '../AccountPayments';
import CustomFormsHub from '../CustomFormsHub';
import CustomForm from '../CustomForm';
import CustomFieldForm from '../CustomFieldForm';
import SidebarLayout from '../SidebarLayout';
import Sidebar from '../Sidebar';
import CustomContractsSection from './CustomContractsSection';
import {AddCustomContract, EditCustomContract} from '../CustomContract';
import {AddCustomEmail, EditCustomEmail} from '../CustomEmail';
import {SidebarLink} from '../Sidebar/Sidebar';
import {SidebarIcon} from '../../../styled/common';
import {Heading, CustomContractSidebarIcon} from './styled';

export enum ACCOUNT_LINKS {
  details = '/account/details',
  customFormsHub = '/account/online-checkin/custom-forms',
  paymentSettings = '/account/payment-settings',
  billing = '/account/billing',
  communications = '/account/communications',
  newCustomEmail = '/account/communications/new-custom-email',
  editCustomEmail = '/account/communications/:id',
  team = '/account/users',
  invite = '/account/users/invite-user',
  edit = '/account/users/edit-user',
  customForm = '/account/online-checkin/custom-forms/:id',
  newCustomForm = '/account/online-checkin/custom-forms/new',
  onlineCheckin = '/account/online-checkin/',
  customField = '/account/online-checkin/custom-forms/:reservationId/custom-field',
  editCustomField = '/account/online-checkin/custom-forms/:reservationId/custom-field/:id',
  customContracts = '/account/custom-contracts',
  newCustomContract = '/account/custom-contracts/new',
  editCustomContract = '/account/custom-contracts/:id',
}

function AccountSections() {
  const {t} = useTranslation();
  const queryClient = useQueryClient();
  const user = useUser();
  const sendingSettingsId = user?.checkin_online_sending_settings_id;
  const {isAccountOwner, isAccountCollaborator} = useComputedDetails();

  const conditionalLinks = React.useMemo(() => {
    return {
      [ACCOUNT_LINKS.paymentSettings]: isAccountOwner,
      [ACCOUNT_LINKS.customFormsHub]: !isAccountCollaborator,
      [ACCOUNT_LINKS.billing]: isAccountOwner,
      [ACCOUNT_LINKS.team]: isAccountOwner,
      [ACCOUNT_LINKS.onlineCheckin]: !isAccountCollaborator,
    };
  }, [isAccountCollaborator, isAccountOwner]);
  const accountLinks: SidebarLink[] = React.useMemo(() => {
    return [
      {
        to: ACCOUNT_LINKS.details,
        name: t('account_details'),
        icon: (active) => <SidebarIcon src={active ? accountActiveIcon : accountIcon} />,
      },
      {
        to: ACCOUNT_LINKS.onlineCheckin,
        name: t('online_check_in'),
        hidden: !conditionalLinks[ACCOUNT_LINKS.onlineCheckin],
        icon: (active) => (
          <SidebarIcon src={active ? guestRegActiveIcon : guestRegIcon} />
        ),
      },

      {
        to: ACCOUNT_LINKS.paymentSettings,
        name: t('payments'),
        hidden: !conditionalLinks[ACCOUNT_LINKS.paymentSettings],
        icon: (active) => (
          <SidebarIcon src={active ? paymentsActiveIcon : paymentsIcon} />
        ),
      },
      {
        to: ACCOUNT_LINKS.billing,
        name: t('billing'),
        hidden: !conditionalLinks[ACCOUNT_LINKS.billing],
        icon: (active) => <SidebarIcon src={active ? billingActiveIcon : billingIcon} />,
      },
      {
        to: ACCOUNT_LINKS.customContracts,
        name: t('custom_contracts'),
        icon: (active) => (
          <CustomContractSidebarIcon
            src={active ? customContractsActiveIcon : customContractsIcon}
          />
        ),
      },
      {
        to: ACCOUNT_LINKS.communications,
        name: t('communications'),
        icon: (active) => (
          <SidebarIcon src={active ? communicationsActiveIcon : communicationsIcon} />
        ),
      },
      {
        to: ACCOUNT_LINKS.team,
        name: t('team'),
        hidden: !conditionalLinks[ACCOUNT_LINKS.team],
        icon: (active) => <SidebarIcon src={active ? teamActiveIcon : teamIcon} />,
      },
    ];
  }, [conditionalLinks, t]);

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
    <SidebarLayout header={<Heading>{t('settings')}</Heading>} sidebar={memoizedSidebar}>
      <Switch>
        <Route exact path={ACCOUNT_LINKS.details}>
          <AccountDetailsSection />
        </Route>
        {conditionalLinks[ACCOUNT_LINKS.onlineCheckin] && (
          <Route exact path={ACCOUNT_LINKS.onlineCheckin}>
            <OnlineCheckinSection />
          </Route>
        )}
        {conditionalLinks[ACCOUNT_LINKS.paymentSettings] && (
          <Route exact path={ACCOUNT_LINKS.paymentSettings}>
            <AccountPayments />
          </Route>
        )}
        {conditionalLinks[ACCOUNT_LINKS.billing] && (
          <Route exact path={ACCOUNT_LINKS.billing}>
            <BillingSections />
          </Route>
        )}
        <Route
          exact
          key={ACCOUNT_LINKS.communications}
          path={ACCOUNT_LINKS.communications}
        >
          <CommunicationSection />
        </Route>
        <Route
          exact
          key={ACCOUNT_LINKS.newCustomEmail}
          path={ACCOUNT_LINKS.newCustomEmail}
        >
          <AddCustomEmail />
        </Route>
        <Route
          exact
          key={ACCOUNT_LINKS.editCustomEmail}
          path={ACCOUNT_LINKS.editCustomEmail}
        >
          <EditCustomEmail />
        </Route>

        <Route
          exact
          key={ACCOUNT_LINKS.customContracts}
          path={ACCOUNT_LINKS.customContracts}
        >
          <CustomContractsSection />
        </Route>
        <Route
          exact
          key={ACCOUNT_LINKS.newCustomContract}
          path={ACCOUNT_LINKS.newCustomContract}
        >
          <AddCustomContract />
        </Route>
        <Route
          exact
          key={ACCOUNT_LINKS.editCustomContract}
          path={ACCOUNT_LINKS.editCustomContract}
        >
          <EditCustomContract />
        </Route>

        {conditionalLinks[ACCOUNT_LINKS.customFormsHub] && [
          <Route
            exact
            key={ACCOUNT_LINKS.customFormsHub}
            path={ACCOUNT_LINKS.customFormsHub}
          >
            <CustomFormsHub />
          </Route>,
          <Route exact key={ACCOUNT_LINKS.customForm} path={ACCOUNT_LINKS.customForm}>
            <CustomForm />
          </Route>,
          <Route
            exact
            key={ACCOUNT_LINKS.customField}
            path={[ACCOUNT_LINKS.customField, ACCOUNT_LINKS.editCustomField]}
          >
            <CustomFieldForm />
          </Route>,
        ]}
        {conditionalLinks[ACCOUNT_LINKS.team] && [
          <Route exact key={ACCOUNT_LINKS.team} path={ACCOUNT_LINKS.team}>
            <AccountTeamSection />
          </Route>,
          <Route exact key={ACCOUNT_LINKS.invite} path={ACCOUNT_LINKS.invite}>
            <InviteUserTeam />
          </Route>,
          <Route exact key={ACCOUNT_LINKS.edit} path={ACCOUNT_LINKS.edit}>
            <EditUserTeam />
          </Route>,
        ]}
      </Switch>
    </SidebarLayout>
  );
}

export {AccountSections};

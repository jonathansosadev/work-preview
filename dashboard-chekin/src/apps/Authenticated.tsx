import React from 'react';
import {Route, Switch, Redirect} from 'react-router-dom';
import {withSentryRouting} from '@sentry/react';
import RotateScreenModal from '../components/dashboard/RotateScreenModal';
import UserPaymentsProviderIncompleteModal from 'components/dashboard/UserPaymentsProviderIncompleteModal';
import SiteMinderInformationModal from '../components/dashboard/SiteMinderInformationModal';
import {TryUpsellingBanner} from 'components/dashboard/Banner/TryUpsellingBanner';
import {FeedbackBanner} from 'components/dashboard/Banner/FeedbackBanner';
import Pages from '../pages';

const SentryRoute = withSentryRouting(Route);

function Authenticated() {
  return (
    <>
      <RotateScreenModal />
      <UserPaymentsProviderIncompleteModal />
      <SiteMinderInformationModal />
      <TryUpsellingBanner />
      <FeedbackBanner />
      <Switch>
        <SentryRoute exact path="/register/pricing" component={Pages.RegisterPricing} />
        <SentryRoute path="/account" component={Pages.Account} />
        <SentryRoute path="/new-properties" component={Pages.NewProperties} />
        <SentryRoute exact path="/properties/import" component={Pages.ImportHousings} />
        <SentryRoute exact path="/properties" component={Pages.Housings} />
        <SentryRoute exact path="/properties/add" component={Pages.HousingsAdd} />
        <SentryRoute
          exact
          path="/properties/connect"
          component={Pages.ConnectProperties}
        />
        <SentryRoute exact path="/properties/:id" component={Pages.HousingsEdit} />
        <SentryRoute exact path="/bookings/import" component={Pages.ImportReservations} />
        <SentryRoute exact path="/bookings" component={Pages.Reservations} />
        <SentryRoute
          exact
          path="/bookings/reservation-report"
          component={Pages.BookingsReservationReport}
        />
        <SentryRoute
          exact
          path="/bookings/guest-report"
          component={Pages.BookingsGuestReport}
        />
        <SentryRoute exact path="/bookings/add" component={Pages.ReservationsAdd} />
        <SentryRoute exact path="/bookings/:id" component={Pages.ReservationsEdit} />
        <SentryRoute exact path="/bookings/:id/guest/:guestId" component={Pages.Guest} />
        <SentryRoute
          exact
          path={[
            '/documents/entry-form/guestbook/:id',
            '/documents/entry-form/guestbook/',
          ]}
          component={Pages.DocumentsEntryFormsGuestbook}
        />
        <SentryRoute
          exact
          path="/documents/entry-form"
          component={Pages.DocumentsEntryForms}
        />
        <SentryRoute
          exact
          path="/documents/entry-form/view/:id"
          component={Pages.DocumentsReservationEntryForms}
        />
        <SentryRoute
          exact
          path="/documents/contracts"
          component={Pages.DocumentsContracts}
        />
        <SentryRoute
          exact
          path="/documents/alloggiati"
          component={Pages.DocumentsAlloggiati}
        />
        <SentryRoute exact path="/documents/idev" component={Pages.DocumentsIDEV} />
        <SentryRoute exact path="/documents/mossos" component={Pages.DocumentsMossos} />
        <SentryRoute
          exact
          path="/subscription/number"
          component={Pages.SubscriptionNumber}
        />
        <SentryRoute
          exact
          path="/subscription/select-plan"
          component={Pages.SubscriptionSelectPlan}
        />
        <SentryRoute
          exact
          path="/subscription/payment"
          component={Pages.SubscriptionPayment}
        />
        <SentryRoute
          exact
          path="/subscription/payment-info"
          component={Pages.SubscriptionPaymentInfo}
        />
        <SentryRoute
          exact
          path="/:monthReportType(de-idev|sl-ajpes)/:housingId/:year/:month"
          component={Pages.MonthlyReport}
        />
        <Route
          exact
          path="/billing/services/self-checkin"
          component={Pages.SelfCheckin}
        />
        <SentryRoute
          exact
          path="/:monthReportType(de-idev)/:housingId/:year/:month"
          component={Pages.MonthlyReport}
        />
        <SentryRoute
          exact
          path="/marketplace/access-providers"
          component={Pages.AccessProviders}
        />
        <SentryRoute
          exact
          path="/marketplace/access-providers/omnitec"
          component={Pages.OmnitecAccessProviderConnect}
        />
        <SentryRoute
          exact
          path="/marketplace/access-providers/nuki"
          component={Pages.NukiAccessProviderConnect}
        />
        <SentryRoute
          exact
          path="/marketplace/access-providers/keycafe"
          component={Pages.KeycafeAccessProviderConnect}
        />
        <SentryRoute
          exact
          path="/marketplace/access-providers/akiles"
          component={Pages.AkilesAccessProviderConnect}
        />
        <SentryRoute
          exact
          path="/oauth/akiles"
          component={Pages.AkilesAccessProviderConnect}
        />
        <SentryRoute
          exact
          path="/marketplace/access-providers/remotelock"
          component={Pages.RemoteLockAccessProviderConnect}
        />
        <SentryRoute
          exact
          path="/oauth/remotelock"
          component={Pages.RemoteLockAccessProviderConnect}
        />
        <SentryRoute
          exact
          path="/oauth/nuki"
          component={Pages.NukiAccessProviderConnect}
        />
        <SentryRoute
          exact
          path="/marketplace/access-providers/keynest"
          component={Pages.KeynestAccessProviderConnect}
        />
        <SentryRoute
          exact
          path="/marketplace/access-providers/salto"
          component={Pages.SaltoAccessProviderConnect}
        />
        <SentryRoute
          exact
          path="/marketplace/access-providers/ttlock"
          component={Pages.TtlockAccessProviderConnect}
        />
        <SentryRoute
          exact
          path="/marketplace/access-providers/mondise"
          component={Pages.MondiseAccessProviderConnect}
        />
        <SentryRoute
          exact
          path="/marketplace/access-providers/roomatic"
          component={Pages.RoomaticAccessProviderConnect}
        />
        <SentryRoute
          exact
          path="/marketplace/access-providers/homeit"
          component={Pages.HomeitAccessProviderConnect}
        />
        <SentryRoute
          exact
          path="/marketplace/property-protection"
          component={Pages.PropertiesConections}
        />
        <SentryRoute
          exact
          path="/marketplace/property-protection/superhog"
          component={Pages.SuperHogPropertyProtection}
        />
        <SentryRoute
          exact
          path="/after-registration"
          component={Pages.AfterRegistration}
        />
        <SentryRoute path="/upselling" component={Pages.Upselling} />
        <Redirect to="/bookings" />
      </Switch>
    </>
  );
}

export default Authenticated;

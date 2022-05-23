import React from 'react';
import {Route, Switch, Redirect} from 'react-router-dom';
import {withSentryRouting} from '@sentry/react';
import Pages from '../pages';

const SentryRoute = withSentryRouting(Route);

function Unauthenticated() {
  return (
    <Switch>
      <SentryRoute exact path="/login" component={Pages.Login} />
      <SentryRoute exact path="/forgot-password" component={Pages.ForgotPassword} />
      <SentryRoute exact path="/register/type" component={Pages.RegisterType} />
      <SentryRoute exact path="/register/number" component={Pages.RegisterNumber} />
      <SentryRoute exact path="/register/pms" component={Pages.RegisterPMS} />
      <SentryRoute exact path="/register/form" component={Pages.RegisterForm} />
      <SentryRoute exact path="/register/pricing" component={Pages.RegisterPricing} />
      <SentryRoute
        exact
        path="/register/pms/guesty-sync"
        component={Pages.PmsGuestyOriginRegister}
      />
      <SentryRoute
        exact
        path="/register/pms/lodgify-sync"
        component={Pages.PmsLodgifyOriginRegister}
      />
      <SentryRoute
        exact
        path="/register/pms/rentals-united-sync"
        component={Pages.PmsRentalsUnitedOriginRegister}
      />
      <SentryRoute
        exact
        path="/register/pms/hostaway-sync"
        component={Pages.PmsHostawayOriginRegister}
      />
      <SentryRoute
        exact
        path="/register/pms/octorate-sync"
        component={Pages.PmsOctorateOriginRegister}
      />
      <SentryRoute
        exact
        path="/register/pms/booking-sync"
        component={Pages.PmsBookingOriginRegister}
      />
      <SentryRoute
        exact
        path="/register/pms/planyo-sync"
        component={Pages.PmsPlanyoOriginRegister}
      />
      <SentryRoute
        exact
        path="/register/pms/smoobu-sync"
        component={Pages.PmsSmoobuOriginRegister}
      />
      <SentryRoute
        exact
        path="/register/pms/mews-sync"
        component={Pages.PmsMewsOriginRegister}
      />
      <SentryRoute
        exact
        path="/register/pms/bookingsync-sync"
        component={Pages.PmsBookingsyncOriginRegister}
      />
      <SentryRoute
        exact
        path="/register/pms/cloudbeds-sync"
        component={Pages.PmsCloudbedsOriginRegister}
      />
      <SentryRoute
        exact
        path="/register/pms/villas-365-sync"
        component={Pages.PmsVillas365OriginRegister}
      />
      <SentryRoute
        exact
        path="/register/pms/resharmonics-sync"
        component={Pages.PmsResharmonicsOriginRegister}
      />
      <SentryRoute
        exact
        path="/register/pms/rentlio-sync"
        component={Pages.PmsRentlioOriginRegister}
      />
      <SentryRoute
        exact
        path="/register/pms/fantasticstay-sync"
        component={Pages.PmsFantasticstayOriginRegister}
      />
      <SentryRoute
        exact
        path="/register/pms/ezee-sync"
        component={Pages.PmsEzeeOriginRegister}
      />
      <SentryRoute
        exact
        path="/register/pms/eviivo-sync"
        component={Pages.PmsEviivoOriginRegister}
      />
      <SentryRoute
        exact
        path="/register/pms/apaleo-sync"
        component={Pages.PmsApaleoOriginRegister}
      />
      <SentryRoute
        exact
        path="/register/pms/eviivo-sync"
        component={Pages.PmsEviivoOriginRegister}
      />
      <SentryRoute
        exact
        path="/register/pms/myvr-sync"
        component={Pages.PmsMyvrOriginRegister}
      />
      <SentryRoute
        exact
        path="/register/pms/hoteliga-sync"
        component={Pages.PmsHoteligaOriginRegister}
      />
      <SentryRoute
        exact
        path="/register/pms/ownerrez-sync"
        component={Pages.PmsOwnerrezOriginRegister}
      />
      <SentryRoute exact path="/after-registration" component={Pages.AfterRegistration} />
      <SentryRoute
        exact
        path="/register/pms/hoteliga-sync"
        component={Pages.PmsHoteligaOriginRegister}
      />
      <SentryRoute
        exact
        path="/register/pms/hostify-sync"
        component={Pages.PmsHostifyOriginRegister}
      />
      <SentryRoute
        exact
        path="/register/pms/channex-sync"
        component={Pages.PmsChannexOriginRegister}
      />
      <Redirect to="/login" />
    </Switch>
  );
}

export default Unauthenticated;

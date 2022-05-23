import React from 'react';
import {Userpilot} from 'userpilot';
import {useLocation} from 'react-router-dom';
import {getTokenFromLocalStorage} from '../../../api';
import {useUser} from '../../../context/user';

const IS_PRODUCTION_BUILD = process.env.NODE_ENV === 'production';

function Analytics() {
  const {pathname} = useLocation();
  const token = getTokenFromLocalStorage();
  const user = useUser();

  React.useEffect(() => {
    if (IS_PRODUCTION_BUILD) {
      Userpilot.reload(window.location.href);
    }
  }, [pathname]);

  React.useEffect(
    function setUserpilotUserData() {
      if (!IS_PRODUCTION_BUILD || !token || !user?.id) {
        return;
      }

      Userpilot?.identify(user.id, {
        createdAt: user?.created_at,
        name: user?.name,
        surname: user?.surname,
        email: user?.email,
        phone: user?.phone,
        origin: user?.origin,
        propertiesRange: user?.segment,
        subscriptionType: user?.subscription_type,
        subscriptionQty: user?.subscription_quantity,
        subscriptionStatus: user?.subscription_status,
      });
    },
    [token, user],
  );

  return null;
}

export {Analytics};

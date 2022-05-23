import React from 'react';
import {useStoredURLParams} from '../../context/storedURLParams';
import {useReservation} from '../../context/reservation';
import {getHousingName} from '../../utils/reservation';
import {getTokenFromLocalStorage} from '../../api';
import {ORIGINS} from '../../utils/constants';
import {driftSetUserAttributes} from '../../analytics/drift';

function Analytics() {
  const {data: reservation} = useReservation();
  const {shortShareLink} = useStoredURLParams();
  const token = getTokenFromLocalStorage();

  React.useEffect(() => {
    if (!token || !reservation.id) {
      return;
    }

    const userAttributes = {
      housing_name: getHousingName(reservation),
      housing_id: reservation?.housing?.id,
      reservation_id: reservation?.id,
      co_link: shortShareLink,
      origin: ORIGINS.checkinOnline,
    };
    driftSetUserAttributes(userAttributes);
  }, [shortShareLink, reservation, token]);

  return null;
}

export {Analytics};

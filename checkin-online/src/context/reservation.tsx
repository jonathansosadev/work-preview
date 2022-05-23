import React from 'react';
import api, {ResolverTypes} from '../api';
import {useStoredURLParams} from './storedURLParams';
import {useAuth} from './auth';
import {Reservation} from '../utils/types';

type ContextProps = {
  data: any;
  isLoading: boolean;
  isLoaded: boolean;
  isError: boolean;
  setReservation: React.Dispatch<React.SetStateAction<any>>;
  refreshReservation: (beforeUpdateCallback?: () => void) => Promise<ResolverTypes>;
  patchReservation: (
    payload: any,
    beforeUpdateCallback?: () => void,
  ) => Promise<ResolverTypes>;
};

const ReservationContext = React.createContext<ContextProps>({
  data: {},
  isLoading: false,
  isLoaded: false,
  isError: false,
  setReservation: () => {},
  refreshReservation: () => Promise.resolve({error: null, data: null}),
  patchReservation: () => Promise.resolve({error: null, data: null}),
});

function ReservationProvider(props: any) {
  const {reservationId} = useStoredURLParams();
  const {isLoading: isLoadingToken, isTokenValid} = useAuth();
  const [reservation, setReservation] = React.useState<Reservation | {}>({});
  const [isLoading, setIsLoading] = React.useState(true);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isError, setIsError] = React.useState(false);

  const patchReservation = React.useCallback(
    async (id = reservationId, payload: any = {}) => {
      setIsLoading(true);
      setIsError(false);

      const response = await api.reservations.patch(id, payload);
      setIsLoading(false);
      return response;
    },
    [reservationId],
  );

  const fetchReservation = React.useCallback(async (id = '') => {
    setIsLoading(true);
    setIsError(false);

    const response = await api.reservations.getOne(id);
    setIsLoading(false);
    return response;
  }, []);

  const fetchAndSetReservation = React.useCallback(
    async (beforeUpdateCallback?: () => void) => {
      if (!reservationId) {
        return;
      }

      const {data, error} = await fetchReservation(reservationId);
      if (data) {
        beforeUpdateCallback && beforeUpdateCallback();
        setReservation(data);
      }
      if (error) {
        setIsError(true);
      }

      return {data, error};
    },
    [fetchReservation, reservationId],
  );

  const patchAndSetReservation = React.useCallback(
    async (payload: any = {}, beforeUpdateCallback?: () => void) => {
      if (!reservationId) {
        return;
      }

      const {data, error} = await patchReservation(reservationId, payload);
      if (data) {
        beforeUpdateCallback && beforeUpdateCallback();
        setReservation(data);
      }
      if (error) {
        setIsError(true);
      }

      return {data, error};
    },
    [patchReservation, reservationId],
  );

  React.useEffect(() => {
    const hasReservation = Object.keys(reservation).length;
    if (hasReservation) {
      setIsLoaded(true);
    }
  }, [reservation]);

  React.useEffect(() => {
    const housingId = sessionStorage.getItem('housing-id');

    if (!isLoadingToken && isTokenValid && !housingId) {
      fetchAndSetReservation();
    }

    if (!isLoadingToken && !isTokenValid) {
      setIsLoading(false);
    }
  }, [fetchAndSetReservation, isTokenValid, isLoadingToken]);

  return (
    <ReservationContext.Provider
      {...props}
      value={{
        isLoading,
        isLoaded,
        isError,
        setReservation,
        patchReservation: patchAndSetReservation,
        refreshReservation: fetchAndSetReservation,
        data: reservation,
      }}
    />
  );
}

function useReservation() {
  const context = React.useContext(ReservationContext);
  if (context === undefined) {
    throw new Error('useReservation must be used within a ReservationProvider');
  }
  return context;
}

export {ReservationContext, ReservationProvider, useReservation};

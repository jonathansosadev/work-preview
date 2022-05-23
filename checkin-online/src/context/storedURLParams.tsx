import React from 'react';
import {getURLSearchParam} from '../utils/common';

type ContextProps = {
  reservationId: string;
  shortShareLink: string;
  setReservationId: React.Dispatch<React.SetStateAction<string>>;
  setShortShareLink: React.Dispatch<React.SetStateAction<string>>;
  setNewReservationId: (id: string) => void;
};

const StoredURLParamsContext = React.createContext<ContextProps>({
  reservationId: '',
  shortShareLink: '',
  setReservationId: () => {},
  setShortShareLink: () => {},
  setNewReservationId: () => {},
});

const RESERVATION_ID_SEARCH_PARAM_NAME = 'reservation-id';
export const SHORT_SHARE_LINK_SEARCH_PARAM_NAME = 'l';

function getReservationIdFromLocalStorage() {
  return localStorage.getItem(RESERVATION_ID_SEARCH_PARAM_NAME) || '';
}

function getShortLinkFromLocalStorage() {
  return localStorage.getItem(SHORT_SHARE_LINK_SEARCH_PARAM_NAME) || '';
}

function setReservationIdToLocalStorage(value = '') {
  localStorage.setItem(RESERVATION_ID_SEARCH_PARAM_NAME, value);
}

function setShortLinkToLocalStorage(value = '') {
  localStorage.setItem(SHORT_SHARE_LINK_SEARCH_PARAM_NAME, value);
}

function buildShortShareLink(link = '') {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  return `${BASE_URL}/L/${link}`;
}

function StoredURLParamsProvider(props: any) {
  const [reservationId, setReservationId] = React.useState<string>(() => {
    return getReservationIdFromLocalStorage();
  });
  const [shortShareLink, setShortShareLink] = React.useState<string>(() => {
    return getShortLinkFromLocalStorage();
  });

  const setNewReservationId = (id: string) => {
    setReservationId(id);
    setReservationIdToLocalStorage(id);
  };

  React.useEffect(() => {
    const nextReservationId = getURLSearchParam(RESERVATION_ID_SEARCH_PARAM_NAME);
    const nextShortShareLink = getURLSearchParam(SHORT_SHARE_LINK_SEARCH_PARAM_NAME);

    if (nextReservationId) {
      setReservationId(nextReservationId);
      setReservationIdToLocalStorage(nextReservationId);
    }
    if (nextShortShareLink) {
      const link = buildShortShareLink(nextShortShareLink);
      setShortShareLink(link);
      setShortLinkToLocalStorage(link);
    }
  }, []);

  return (
    <StoredURLParamsContext.Provider
      {...props}
      value={{
        reservationId,
        shortShareLink,
        setReservationId,
        setShortShareLink,
        setNewReservationId,
      }}
    />
  );
}

function useStoredURLParams() {
  const context = React.useContext(StoredURLParamsContext);
  if (context === undefined) {
    throw new Error('useStoredURLParams must be used within a StoredURLParamsProvider');
  }
  return context;
}

export {
  StoredURLParamsContext,
  StoredURLParamsProvider,
  useStoredURLParams,
  RESERVATION_ID_SEARCH_PARAM_NAME,
};

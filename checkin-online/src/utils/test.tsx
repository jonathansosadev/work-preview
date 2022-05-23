import React from 'react';
import {render} from '@testing-library/react';
import api from '../api';
import {createMemoryHistory} from 'history';
import useSWR from 'swr';
import {Router} from 'react-router-dom';
import {ReservationContext} from '../context/reservation';
import {ComputedReservationDetailsProvider} from '../context/computedReservationDetails';

const FAKE_RESERVATION = {
  data: {
    id: 1,
    housing: {
      id: 'testId',
      picture: {
        src: '',
      },
      location: {
        country: {
          code: 'ES',
        },
      },
    },
  },
  isError: false,
  isLoading: false,
  refreshReservation: () => {
    return api.reservations.getOne('');
  },
  patchReservation: () => {
    return api.reservations.patch('', {});
  },
};

function getNextReservation(reservation?: any) {
  if (!reservation) {
    return FAKE_RESERVATION;
  }

  return {
    ...FAKE_RESERVATION,
    ...reservation,
  };
}

function renderWithProviders(
  ui: React.ReactNode,
  reservation?: any,
  locationState?: any,
) {
  const nextReservation = getNextReservation(reservation);
  const history = createMemoryHistory();
  history.push('/', locationState || {});

  const utils = render(
    <Router history={history}>
      <ReservationContext.Provider value={nextReservation}>
        <ComputedReservationDetailsProvider>{ui}</ComputedReservationDetailsProvider>
      </ReservationContext.Provider>
    </Router>,
  );

  const rerenderWithProviders = (rerenderUi: React.ReactNode = ui, reservation?: any) => {
    const nextReservation = getNextReservation(reservation);
    return utils.rerender(
      <Router history={history}>
        <ReservationContext.Provider value={nextReservation}>
          <ComputedReservationDetailsProvider>
            {rerenderUi}
          </ComputedReservationDetailsProvider>
        </ReservationContext.Provider>
      </Router>,
    );
  };

  return {
    ...utils,
    history,
    rerenderWithProviders,
  };
}

function changeReservationCountryCode(reservation: any = {}, code = '') {
  return {
    ...reservation,
    data: {
      ...reservation.data,
      housing: {
        ...reservation.housing,
        location: {
          ...reservation.location,
          country: {
            ...reservation.country,
            code,
          },
        },
      },
    },
  };
}

function mockSWR(
  mocks: {
    url: string;
    response: {data: any; error?: any};
  }[] = [],
) {
  const swrBase = {
    data: null,
    error: null,
    isValidating: false,
    mutate: jest.fn(),
  };

  // @ts-ignore
  useSWR.mockImplementation((requestUrl: string | (() => string | null) = '') => {
    if (!requestUrl) {
      return {...swrBase};
    }

    const urlMock = mocks.find(mock => {
      if (typeof requestUrl === 'function') {
        const fnResult = requestUrl();
        if (!fnResult) {
          return {...swrBase};
        }

        return fnResult.includes(mock.url);
      } else {
        return requestUrl.includes(mock.url);
      }
    });

    if (urlMock) {
      return {
        ...swrBase,
        ...urlMock.response,
      };
    }

    return {...swrBase};
  });
}

export {FAKE_RESERVATION, renderWithProviders, changeReservationCountryCode, mockSWR};

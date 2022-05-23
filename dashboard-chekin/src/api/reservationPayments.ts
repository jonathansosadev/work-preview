import {queryFetcher, resolver} from '.';
import {MarkAsPaid} from '../components/dashboard/ReservationPayments';

const ENDPOINTS = {
  getReservationPayments: (id: string) => `reservation-payments/?reservation=${id}`,
  markAsPaid: (id: string) => `reservations/${id}/mark-as-paid/`,
};

function markAsPaid(id: string, payload: MarkAsPaid) {
  return resolver(ENDPOINTS.markAsPaid(id), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

function fetchReservationPayments(id: string) {
  return queryFetcher(ENDPOINTS.getReservationPayments(id));
}

export {ENDPOINTS, fetchReservationPayments, markAsPaid};

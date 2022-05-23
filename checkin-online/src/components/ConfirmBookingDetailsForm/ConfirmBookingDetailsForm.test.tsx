/**  * @jest-environment jsdom-sixteen  */
import React from 'react';
import {act, fireEvent, waitForElementToBeRemoved, screen} from '@testing-library/react';
import {changeReservationCountryCode, renderWithProviders} from '../../utils/test';
import {
  getCheckInDate,
  getCheckOutDate,
  getNumberOfGuests,
} from '../../utils/reservation';
import {COUNTRY_CODES} from '../../utils/constants';
import {
  ConfirmBookingDetailsForm,
  FORM_NAMES,
  getFormattedDateOrFallback,
  MIN_INPUT_NUMBERS,
} from './ConfirmBookingDetailsForm';
import {IpDetailsContext} from '../../context/ipDetails';

const reservation = {
  data: {
    check_in_date: String(new Date('10/04/2010')),
    check_out_date: String(new Date('10/04/2020')),
    housing: {
      location: {
        country: {
          code: COUNTRY_CODES.spain,
        },
      },
    },
    guest_group: {
      number_of_guests: '',
    },
  },
};

test('sets defaults, changes and submits form fields', async () => {
  const {getByLabelText, getAllByText, getByText, findByText} = renderWithProviders(
    <ConfirmBookingDetailsForm />,
    reservation,
  );

  const desktopSubmitButton = getAllByText(/next/i)[0];

  const checkInDate = getCheckInDate(reservation.data);
  const formattedCheckInDate = getFormattedDateOrFallback(checkInDate);
  expect(formattedCheckInDate).toEqual('04/10/2010');
  const checkInDateInput = getByLabelText(/check_in_date/i);
  expect(checkInDateInput).toHaveValue(formattedCheckInDate);

  const checkOutDate = getCheckOutDate(reservation.data);
  const formattedCheckOutDate = getFormattedDateOrFallback(checkOutDate);
  expect(formattedCheckOutDate).toEqual('04/10/2020');
  const checkOutDateInput = getByLabelText(/check_out_date/i);
  expect(checkOutDateInput).toHaveValue(formattedCheckOutDate);

  const numberOfGuests = getNumberOfGuests(
    reservation.data,
    MIN_INPUT_NUMBERS.number_of_guests,
  );
  expect(numberOfGuests).toEqual(MIN_INPUT_NUMBERS[FORM_NAMES.numberOfGuests]);
  const childrenInput = getByLabelText(/children/i);
  expect(childrenInput).toHaveValue(MIN_INPUT_NUMBERS[FORM_NAMES.children]);

  await act(async () => {
    await fireEvent.change(childrenInput, {target: {value: -1}});
    expect(childrenInput).toHaveValue(-1);
    await fireEvent.click(desktopSubmitButton);
    await findByText(/min_number_is/i);

    await fireEvent.change(childrenInput, {target: {value: 5}});
    expect(childrenInput).toHaveValue(5);
    await fireEvent.click(desktopSubmitButton);
    await waitForElementToBeRemoved(() => getByText(/min_number_is/i));
  });

  const numberOfGuestsInput = getByLabelText(/number_of_guests/i);
  expect(numberOfGuestsInput).toHaveValue(MIN_INPUT_NUMBERS[FORM_NAMES.numberOfGuests]);
  await act(async () => {
    await fireEvent.change(numberOfGuestsInput, {target: {value: -1}});
    await fireEvent.click(desktopSubmitButton);
    await findByText(/min_number_is/i);

    await fireEvent.change(numberOfGuestsInput, {target: {value: 6}});
    expect(numberOfGuestsInput).toHaveValue(6);
    await fireEvent.click(desktopSubmitButton);
    await waitForElementToBeRemoved(() => getByText(/min_number_is/i));
  });
});

test('conditionally displays fields', () => {
  const {getByLabelText, queryByLabelText, rerenderWithProviders} = renderWithProviders(
    <ConfirmBookingDetailsForm />,
    reservation,
  );

  const countryCodesWithChildren = [
    COUNTRY_CODES.spain,
    COUNTRY_CODES.france,
    COUNTRY_CODES.uk,
  ];
  countryCodesWithChildren.forEach(async countryCode => {
    const changedReservation = changeReservationCountryCode(reservation, countryCode);
    rerenderWithProviders(<ConfirmBookingDetailsForm />, changedReservation);

    const childrenInput = getByLabelText(/number_of_guests/i);
    expect(childrenInput).toBeInTheDocument();

    const adultsInput = getByLabelText(/children/i);
    expect(adultsInput).toBeInTheDocument();
  });

  const otherCountryCodes = Object.values(COUNTRY_CODES).filter(code => {
    return !countryCodesWithChildren.includes(code);
  });
  otherCountryCodes.forEach(async countryCode => {
    const changedReservation = changeReservationCountryCode(reservation, countryCode);
    rerenderWithProviders(<ConfirmBookingDetailsForm />, changedReservation);

    const numberOfGuestsInput = getByLabelText(/number_of_guests/i);
    expect(numberOfGuestsInput).toBeInTheDocument();

    const childrenInput = queryByLabelText(/children_under_number/i);
    expect(childrenInput).not.toBeInTheDocument();
  });
});

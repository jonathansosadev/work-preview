/**  * @jest-environment jsdom-sixteen  */
import React from 'react';
import {screen} from '@testing-library/react';
import {renderWithProviders} from '../../utils/test';
import {TaxesSetupScreen} from './TaxesSetupScreen';

test('renders guests info', async () => {
  let reservation = {
    data: {
      id: 'id',
      have_taxes_been_paid: false,
      housing: {
        seasons: ['low', 'high'],
      },
      guest_group: {
        number_of_guests: 2,
      },
    },
  };

  const {rerenderWithProviders} = renderWithProviders(<TaxesSetupScreen />, reservation);
  const isTaxesScreen = screen.getByText(/total_taxes/i);
  expect(isTaxesScreen).toBeTruthy();

  const guestNamesQuery = /guest/i;
  expect(screen.getAllByText(guestNamesQuery)).toHaveLength(
    reservation.data.guest_group.number_of_guests,
  );

  reservation = {
    data: {
      ...reservation.data,
      guest_group: {
        number_of_guests: 3,
      },
    },
  };
  rerenderWithProviders(<TaxesSetupScreen />, reservation);
  expect(screen.getAllByText(guestNamesQuery)).toHaveLength(
    reservation.data.guest_group.number_of_guests,
  );
});

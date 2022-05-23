import React from 'react';
import {HousingPicture} from './HousingPicture';
import {renderWithProviders} from '../../utils/test';
import {getHousingPicture} from '../../utils/reservation';

test('gets and shows housing name and picture', () => {
  const reservation = {
    data: {
      housing: {
        picture: {
          src: 'test',
        },
      },
    },
  };
  const {getByAltText, rerender, queryByAltText} = renderWithProviders(
    <HousingPicture />,
    reservation,
  );

  const picture = getHousingPicture(reservation.data);
  const logo = getByAltText(/house/i);
  expect(logo).toHaveAttribute('src', picture);

  rerender(<HousingPicture />);

  const noPicture = getHousingPicture(null);
  expect(noPicture).toBeFalsy();
  const logoContainer = queryByAltText(/house/i);
  expect(logoContainer).not.toBeInTheDocument();
});

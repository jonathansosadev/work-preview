import React from 'react';
import {renderWithProviders} from '../../utils/test';
import {fireEvent} from '@testing-library/react';
import {ConfirmIdentityResultScreen} from './ConfirmIdentityResultScreen';

test('displays success or error based on match', async () => {
  const reservation = {
    data: {
      id: 'test id',
      guest_group: {
        leader_id: 'test',
      },
    },
  };

  const locationState = {
    facesComparingResult: {
      is_match: false,
    },
    isVerifying: true,
    documentPhoto: 'doc',
    selfiePhoto: 'selfie',
  };

  const {getByTestId, history, queryByAltText, findByText} = renderWithProviders(
    <ConfirmIdentityResultScreen />,
    reservation,
    locationState,
  );
  const historySpy = jest.spyOn(history, 'push');

  let successTitleIcon = queryByAltText(/green check mark/i);
  expect(successTitleIcon).not.toBeInTheDocument();
  let errorTitleIcon = queryByAltText(/exclamation mark/i);
  expect(errorTitleIcon).toBeInTheDocument();

  let submitButton = getByTestId(/submit-btn/i);
  expect(submitButton).toHaveTextContent(/try_again/i);
  fireEvent.click(submitButton);

  history.push('/', {
    ...locationState,
    facesComparingResult: {
      is_match: true,
    },
  });
  successTitleIcon = queryByAltText(/green check mark/i);
  expect(successTitleIcon).toBeInTheDocument();
  errorTitleIcon = queryByAltText(/exclamation mark/i);
  expect(errorTitleIcon).not.toBeInTheDocument();

  submitButton = await findByText(/next/i);
  fireEvent.click(submitButton);

  expect(historySpy.mock.calls[2]).toMatchSnapshot();
});

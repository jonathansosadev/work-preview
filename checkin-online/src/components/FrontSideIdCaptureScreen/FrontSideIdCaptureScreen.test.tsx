import React from 'react';
import {act, fireEvent} from '@testing-library/react';
import {renderWithProviders} from '../../utils/test';
import {TIMEOUT_BEFORE_REDIRECT_MS} from '../../utils/constants';
import {FrontSideIdCaptureScreen} from './FrontSideIdCaptureScreen';

jest.useFakeTimers();

test('submits image', () => {
  const {getByTestId, queryByText} = renderWithProviders(<FrontSideIdCaptureScreen />);

  const submitButton = getByTestId(/submit-btn/i);
  fireEvent.click(submitButton);
  const successModal = queryByText(/success/i);
  act(() => {
    jest.advanceTimersByTime(TIMEOUT_BEFORE_REDIRECT_MS);
    expect(successModal).not.toBeInTheDocument();
  });
});

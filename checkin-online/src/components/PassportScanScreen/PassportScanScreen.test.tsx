import React from 'react';
import {act, fireEvent, waitForElementToBeRemoved, screen} from '@testing-library/react';
import api from '../../api';
import {renderWithProviders} from '../../utils/test';
import {PassportScanScreen} from './PassportScanScreen';
import {
  COUNTRY_CODES_WITHOUT_SIGNATURE,
  TIMEOUT_BEFORE_REDIRECT_MS,
} from '../../utils/constants';

jest.mock('../../api');
jest.useFakeTimers();

test('submits image and creates guest', async () => {
  const reservation = {
    data: {
      housing: {
        location: {
          country: {
            code: COUNTRY_CODES_WITHOUT_SIGNATURE[0],
          },
        },
      },
    },
  };

  (api.guests.post as jest.Mock).mockResolvedValue({
    error: true,
  });
  (api.reservations.patch as jest.Mock).mockResolvedValue({
    error: true,
  });
  (api.reservations.getOne as jest.Mock).mockResolvedValue({
    error: true,
  });

  const {rerenderWithProviders, history} = renderWithProviders(
    <PassportScanScreen />,
    reservation,
  );
  const submitButton = screen.getByTestId(/submit-btn/i);
  fireEvent.click(submitButton);
  expect(setTimeout).toHaveBeenCalled();
  let successModal = await screen.findByText(/success/);
  expect(successModal).toBeInTheDocument();
  await act(async () => {
    jest.advanceTimersByTime(TIMEOUT_BEFORE_REDIRECT_MS);
    expect(successModal).not.toBeInTheDocument();
    await screen.findByText(/sending_your_data/);
    const errorModal = await screen.findByText(/error_sad_face/);
    expect(errorModal).toBeInTheDocument();
  });

  expect(api.reservations.patch).toHaveBeenCalledTimes(1);
  expect(api.guests.post).not.toHaveBeenCalled();
  expect(api.reservations.getOne).not.toHaveBeenCalled();

  (api.reservations.patch as jest.Mock).mockResolvedValue({
    error: false,
  });
  fireEvent.click(submitButton);
  successModal = await screen.findByText(/success/);
  expect(successModal).toBeInTheDocument();
  await act(async () => {
    jest.advanceTimersByTime(TIMEOUT_BEFORE_REDIRECT_MS);
    expect(successModal).not.toBeInTheDocument();
    const progressModal = screen.getByText(/sending_your_data/);
    expect(progressModal).toBeInTheDocument();
    const errorModal = await screen.findByText(/error_sad_face/);
    expect(errorModal).toBeInTheDocument();
  });
  expect(api.reservations.patch).toHaveBeenCalledTimes(2);
  expect(api.guests.post).toHaveBeenCalledTimes(1);
  expect(api.reservations.getOne).not.toHaveBeenCalled();

  (api.guests.post as jest.Mock).mockResolvedValue({
    error: false,
  });
  expect(api.reservations.getOne).not.toHaveBeenCalled();
  fireEvent.click(submitButton);
  successModal = await screen.findByText(/success/);
  expect(successModal).toBeInTheDocument();
  await act(async () => {
    jest.advanceTimersByTime(TIMEOUT_BEFORE_REDIRECT_MS);
    expect(successModal).not.toBeInTheDocument();
    const progressModal = screen.getByText(/sending_your_data/);
    expect(progressModal).toBeInTheDocument();
    await waitForElementToBeRemoved(() => screen.getByText(/sending_your_data/));
    const errorModal = screen.queryByText(/error_sad_face/);
    expect(errorModal).toBeInTheDocument();
  });
  expect(api.reservations.patch).toHaveBeenCalledTimes(3);
  expect(api.guests.post).toHaveBeenCalledTimes(2);
  expect(api.reservations.getOne).toHaveBeenCalledTimes(1);

  (api.reservations.getOne as jest.Mock).mockResolvedValue({
    error: false,
  });
  fireEvent.click(submitButton);
  successModal = await screen.findByText(/success/);
  expect(successModal).toBeInTheDocument();
  await act(async () => {
    jest.advanceTimersByTime(TIMEOUT_BEFORE_REDIRECT_MS);
    expect(successModal).not.toBeInTheDocument();
    const progressModal = screen.getByText(/sending_your_data/);
    expect(progressModal).toBeInTheDocument();
    await waitForElementToBeRemoved(() => screen.getByText(/sending_your_data/));
    const errorModal = screen.queryByText(/error_sad_face/);
    expect(errorModal).not.toBeInTheDocument();
  });
  expect(api.reservations.patch).toHaveBeenCalledTimes(4);
  expect(api.guests.post).toHaveBeenCalledTimes(3);
  expect(api.reservations.getOne).toHaveBeenCalledTimes(2);

  const reservationWithGuestMembers = {
    data: {
      ...reservation.data,
      guest_group: {
        members: ['hi'],
      },
    },
  };
  rerenderWithProviders(<PassportScanScreen />, reservationWithGuestMembers);
  history.push('/', {formData: {}});

  fireEvent.click(submitButton);
  successModal = await screen.findByText(/success/);
  expect(successModal).toBeInTheDocument();
  await act(async () => {
    jest.advanceTimersByTime(TIMEOUT_BEFORE_REDIRECT_MS);
    expect(successModal).not.toBeInTheDocument();
    await screen.findByText(/sending_your_data/);
    await waitForElementToBeRemoved(() => screen.getByText(/sending_your_data/));
    const errorModal = screen.queryByText(/error_sad_face/);
    expect(errorModal).not.toBeInTheDocument();
  });
  expect(api.reservations.patch).toHaveBeenCalledTimes(4);
  expect(api.guests.post).toHaveBeenCalledTimes(4);
  expect(api.reservations.getOne).toHaveBeenCalledTimes(3);
});

import React from 'react';
import api from '../../api';
import {renderWithProviders} from '../../utils/test';
import {act, fireEvent} from '@testing-library/react';
import {OCR_CHECKING_STATUSES, TIMEOUT_BEFORE_REDIRECT_MS} from '../../utils/constants';
import {ConfirmDocumentIdentityScreen} from './ConfirmDocumentIdentityScreen';

jest.mock('../../api');
jest.useFakeTimers();

test('takes photo and identifies face on it', async () => {
  (api.ocr.sendDocumentForFaceDetection as jest.Mock).mockResolvedValue({
    error: {
      message: 'send doc error',
    },
  });
  (api.ocr.checkDocumentFaceDetection as jest.Mock).mockResolvedValue({
    error: {
      message: 'check doc error',
    },
  });
  (api.housingExemptions.getById as jest.Mock).mockResolvedValue({
    data: null,
  });

  const {
    getByText,
    findByAltText,
    findByText,
    queryByAltText,
    queryByText,
    history,
  } = renderWithProviders(<ConfirmDocumentIdentityScreen />);
  const historySpy = jest.spyOn(history, 'push');

  expect(queryByAltText(/exclamation error mark/i)).not.toBeInTheDocument();

  const captureButton = getByText(/^capture$/);
  fireEvent.click(captureButton);
  expect(await findByText(/send doc error/)).toBeInTheDocument();

  const documentCheckId = 'testId';
  (api.ocr.sendDocumentForFaceDetection as jest.Mock).mockResolvedValue({
    data: {
      id: documentCheckId,
    },
  });
  fireEvent.click(captureButton);
  expect(await findByText(/check doc error/)).toBeInTheDocument();
  expect(queryByText(/send doc error/)).not.toBeInTheDocument();
  expect((api.ocr.checkDocumentFaceDetection as jest.Mock).mock.calls[0][0]).toEqual(
    documentCheckId,
  );
  let closeErrorModalButton = getByText(/ok/i);
  fireEvent.click(closeErrorModalButton);
  expect(queryByText(/check doc error/)).not.toBeInTheDocument();

  (api.ocr.checkDocumentFaceDetection as jest.Mock).mockResolvedValue({
    error: null,
    data: {
      status: OCR_CHECKING_STATUSES.error,
    },
  });
  fireEvent.click(captureButton);
  expect(queryByAltText(/scanner/i)).toBeInTheDocument();
  let errorModal = await findByAltText(/exclamation error mark/i);
  expect(errorModal).toBeInTheDocument();
  expect((api.ocr.checkDocumentFaceDetection as jest.Mock).mock.calls[1][0]).toEqual(
    documentCheckId,
  );
  closeErrorModalButton = getByText(/ok/i);
  fireEvent.click(closeErrorModalButton);
  expect(queryByAltText(/exclamation error mark/i)).not.toBeInTheDocument();

  (api.ocr.checkDocumentFaceDetection as jest.Mock).mockResolvedValue({
    error: null,
    data: {
      status: OCR_CHECKING_STATUSES.complete,
      is_face_detected: false,
    },
  });
  fireEvent.click(captureButton);
  expect(queryByAltText(/scanner/i)).toBeInTheDocument();
  errorModal = await findByAltText(/exclamation error mark/i);
  expect(errorModal).toBeInTheDocument();
  expect((api.ocr.checkDocumentFaceDetection as jest.Mock).mock.calls[2][0]).toEqual(
    documentCheckId,
  );
  closeErrorModalButton = getByText(/ok/i);
  fireEvent.click(closeErrorModalButton);
  expect(queryByAltText(/exclamation error mark/i)).not.toBeInTheDocument();

  (api.ocr.checkDocumentFaceDetection as jest.Mock).mockResolvedValue({
    error: null,
    data: {
      status: OCR_CHECKING_STATUSES.complete,
      is_face_detected: true,
    },
  });
  fireEvent.click(captureButton);
  expect(queryByAltText(/scanner/i)).toBeInTheDocument();
  const successModal = await findByText(/success/i);
  expect(successModal).toBeInTheDocument();
  expect((api.ocr.checkDocumentFaceDetection as jest.Mock).mock.calls[3][0]).toEqual(
    documentCheckId,
  );

  act(() => {
    jest.advanceTimersByTime(TIMEOUT_BEFORE_REDIRECT_MS);
    expect(successModal).not.toBeInTheDocument();
  });
  expect(historySpy.mock.calls[0]).toMatchSnapshot();
});

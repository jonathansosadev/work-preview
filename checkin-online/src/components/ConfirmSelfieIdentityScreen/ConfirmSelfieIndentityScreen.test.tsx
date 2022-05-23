import React from 'react';
import api from '../../api';
import {fireEvent} from '@testing-library/react';
import {renderWithProviders} from '../../utils/test';
import {OCR_CHECKING_STATUSES} from '../../utils/constants';
import {ConfirmSelfieIdentityScreen} from './ConfirmSelfieIdentityScreen';

jest.mock('../../api');

test('takes photo, identifies face on it and compares two photos', async () => {
  (api.ocr.sendSelfieForFaceDetection as jest.Mock).mockResolvedValue({
    error: {
      message: 'send selfie error',
    },
  });
  (api.ocr.checkSelfieFaceDetection as jest.Mock).mockResolvedValue({
    error: {
      message: 'check selfie error',
    },
  });
  (api.ocr.compareSelfieAndDocumentFaces as jest.Mock).mockResolvedValue({
    error: {
      message: 'compare docs error',
    },
  });
  (api.ocr.checkSelfieAndDocumentFacesComparingStatus as jest.Mock).mockResolvedValue({
    error: {
      message: 'check compare docs error',
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
  } = renderWithProviders(<ConfirmSelfieIdentityScreen />);
  const historySpy = jest.spyOn(history, 'push');

  expect(queryByAltText(/exclamation error mark/i)).not.toBeInTheDocument();

  const captureButton = getByText(/^capture$/);
  fireEvent.click(captureButton);
  expect(await findByText(/send selfie error/)).toBeInTheDocument();

  const selfieCheckId = 'testId';
  (api.ocr.sendSelfieForFaceDetection as jest.Mock).mockResolvedValue({
    data: {
      id: selfieCheckId,
    },
  });
  fireEvent.click(captureButton);
  expect(await findByText(/check selfie error/)).toBeInTheDocument();
  expect(queryByText(/send selfie error/)).not.toBeInTheDocument();
  expect((api.ocr.checkSelfieFaceDetection as jest.Mock).mock.calls[0][0]).toEqual(
    selfieCheckId,
  );
  let closeErrorModalButton = getByText(/ok/i);
  fireEvent.click(closeErrorModalButton);
  expect(queryByText(/check selfie error/)).not.toBeInTheDocument();

  (api.ocr.checkSelfieFaceDetection as jest.Mock).mockResolvedValue({
    error: null,
    data: {
      status: OCR_CHECKING_STATUSES.error,
    },
  });
  fireEvent.click(captureButton);
  let detectingModal = queryByAltText(/female/i);
  expect(detectingModal).toBeInTheDocument();
  let errorModal = await findByAltText(/exclamation error mark/i);
  expect(errorModal).toBeInTheDocument();
  expect((api.ocr.checkSelfieFaceDetection as jest.Mock).mock.calls[1][0]).toEqual(
    selfieCheckId,
  );
  closeErrorModalButton = getByText(/ok/i);
  fireEvent.click(closeErrorModalButton);
  expect(queryByAltText(/exclamation error mark/i)).not.toBeInTheDocument();

  (api.ocr.checkSelfieFaceDetection as jest.Mock).mockResolvedValue({
    error: null,
    data: {
      status: OCR_CHECKING_STATUSES.complete,
      is_face_detected: false,
    },
  });
  fireEvent.click(captureButton);
  detectingModal = queryByAltText(/female/i);
  expect(detectingModal).toBeInTheDocument();
  errorModal = await findByAltText(/exclamation error mark/i);
  expect(errorModal).toBeInTheDocument();
  expect((api.ocr.checkSelfieFaceDetection as jest.Mock).mock.calls[2][0]).toEqual(
    selfieCheckId,
  );
  closeErrorModalButton = getByText(/ok/i);
  fireEvent.click(closeErrorModalButton);
  expect(queryByAltText(/exclamation error mark/i)).not.toBeInTheDocument();

  (api.ocr.checkSelfieFaceDetection as jest.Mock).mockResolvedValue({
    error: null,
    data: {
      status: OCR_CHECKING_STATUSES.complete,
      is_face_detected: true,
    },
  });
  fireEvent.click(captureButton);
  detectingModal = queryByAltText(/female/i);
  expect(detectingModal).toBeInTheDocument();
  expect(await findByText(/compare docs error/)).toBeInTheDocument();
  expect((api.ocr.checkSelfieFaceDetection as jest.Mock).mock.calls[3][0]).toEqual(
    selfieCheckId,
  );

  const compareSelfieAndDocId = 'testCompareId';
  (api.ocr.compareSelfieAndDocumentFaces as jest.Mock).mockResolvedValue({
    error: null,
    data: {
      id: compareSelfieAndDocId,
    },
  });
  fireEvent.click(captureButton);
  detectingModal = queryByAltText(/female/i);
  expect(detectingModal).toBeInTheDocument();
  errorModal = await findByText(/check compare docs error/i);
  expect(errorModal).toBeInTheDocument();
  expect((api.ocr.checkSelfieFaceDetection as jest.Mock).mock.calls[4][0]).toEqual(
    selfieCheckId,
  );
  expect(
    (api.ocr.checkSelfieAndDocumentFacesComparingStatus as jest.Mock).mock.calls[0][0],
  ).toEqual(compareSelfieAndDocId);
  closeErrorModalButton = getByText(/ok/i);
  fireEvent.click(closeErrorModalButton);
  expect(queryByText(/check compare docs error/i)).not.toBeInTheDocument();

  (api.ocr.checkSelfieAndDocumentFacesComparingStatus as jest.Mock).mockResolvedValue({
    error: null,
    data: {
      status: OCR_CHECKING_STATUSES.error,
      is_match: false,
    },
  });
  fireEvent.click(captureButton);
  detectingModal = queryByAltText(/female/i);
  expect(detectingModal).toBeInTheDocument();
  errorModal = await findByAltText(/exclamation error mark/i);
  expect(errorModal).toBeInTheDocument();
  expect((api.ocr.checkSelfieFaceDetection as jest.Mock).mock.calls[5][0]).toEqual(
    selfieCheckId,
  );
  expect(
    (api.ocr.checkSelfieAndDocumentFacesComparingStatus as jest.Mock).mock.calls[1][0],
  ).toEqual(compareSelfieAndDocId);

  (api.ocr.checkSelfieAndDocumentFacesComparingStatus as jest.Mock).mockResolvedValue({
    error: null,
    data: {
      status: OCR_CHECKING_STATUSES.complete,
      is_match: true,
    },
  });
  fireEvent.click(captureButton);
  detectingModal = queryByAltText(/female/i);
  expect(detectingModal).toBeInTheDocument();
  await findByAltText(/scanning female/i);
  expect(historySpy.mock.calls[0]).toMatchSnapshot();
});

import {resolver} from './index';

const ENDPOINTS = {
  biomatchIdentification: (id = '') => `biomatch/identification/${id ? `${id}/` : ``}`,
  biomatchPerson: (id = '') => `biomatch/person/${id ? `${id}/` : ``}`,
  biomatchCompare: (id = '') => `biomatch/compare/${id ? `${id}/` : ``}`,
  picture: () => `ocr/picture/`,
  pictureData: (id = '') => `ocr/data/${id ? `${id}/` : ``}`,
};

function sendDocumentForFaceDetection(
  image: string,
  reservationId: string,
  options = {},
) {
  const payload = {
    picture_file: image,
    reservation_id: reservationId,
  };

  return resolver(ENDPOINTS.biomatchIdentification(), {
    method: 'POST',
    body: JSON.stringify(payload),
    ...options,
  });
}

function checkDocumentFaceDetection(id: string, options = {}) {
  return resolver(ENDPOINTS.biomatchIdentification(id), {
    ...options,
  });
}

function sendSelfieForFaceDetection(image: string, reservationId: string, options = {}) {
  const payload = {
    picture_file: image,
    reservation_id: reservationId,
  };

  return resolver(ENDPOINTS.biomatchPerson(), {
    method: 'POST',
    body: JSON.stringify(payload),
    ...options,
  });
}

function checkSelfieFaceDetection(id: string, options = {}) {
  return resolver(ENDPOINTS.biomatchPerson(id), {
    contentType: {},
    ...options,
  });
}

type ComparingTypes = {
  documentCheckId: string;
  selfieCheckId: string;
  [key: string]: any;
};

function compareSelfieAndDocumentFaces({
  documentCheckId,
  selfieCheckId,
  reservationId,
  ...options
}: ComparingTypes) {
  const payload = {
    reservation_id: reservationId,
    identification_picture: documentCheckId,
    person_picture: selfieCheckId,
  };

  return resolver(ENDPOINTS.biomatchCompare(), {
    method: 'POST',
    body: JSON.stringify(payload),
    ...options,
  });
}

function checkSelfieAndDocumentFacesComparingStatus(id = '', options = {}) {
  return resolver(ENDPOINTS.biomatchCompare(id), {
    contentType: {},
    ...options,
  });
}

type UpdateFacesComparingPayload = {
  guest_name: string;
  reservation_creation_date: Date | string;
};
function updateFacesComparing(id = '', payload: UpdateFacesComparingPayload) {
  return resolver(ENDPOINTS.biomatchCompare(id), {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

function sendImageForMRZDetection(image = '', reservationId = '', options = {}) {
  const payload = {
    picture_file: image,
    reservation_id: reservationId,
  };

  return resolver(ENDPOINTS.picture(), {
    method: 'POST',
    body: JSON.stringify(payload),
    ...options,
  });
}

function checkImageMRZDetection(id = '', options = {}) {
  return resolver(ENDPOINTS.pictureData(id), options);
}

export {
  ENDPOINTS,
  sendDocumentForFaceDetection,
  checkDocumentFaceDetection,
  sendSelfieForFaceDetection,
  checkSelfieFaceDetection,
  compareSelfieAndDocumentFaces,
  checkSelfieAndDocumentFacesComparingStatus,
  checkImageMRZDetection,
  sendImageForMRZDetection,
  updateFacesComparing,
};

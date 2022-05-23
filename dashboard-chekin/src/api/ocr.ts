import {resolver} from './index';

const ENDPOINTS = {
  biomatchIdentification: (id = '') => `biomatch/identification/${id ? `${id}/` : ``}`,
  biomatchPerson: (id = '') => `biomatch/person/${id ? `${id}/` : ``}`,
  biomatchCompare: (id = '') => `biomatch/compare/${id ? `${id}/` : ``}`,
  picture: () => `ocr/picture/`,
  pictureData: (id = '') => `ocr/data/${id ? `${id}/` : ``}`,
};

function sendDocumentForFaceDetection(image: string, options = {}) {
  const payload = {
    picture_file: image,
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

function sendSelfieForFaceDetection(image: string, options = {}) {
  const payload = {
    picture_file: image,
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
  ...options
}: ComparingTypes) {
  const payload = {
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

function sendImageForMRZDetection(image = '', options = {}) {
  const payload = {
    picture_file: image,
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
};

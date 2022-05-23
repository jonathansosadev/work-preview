import {resolver} from './index';

const mainPoint = 'validators';

const ENDPOINTS = {
  phoneNumber: () => `${mainPoint}/phone-number`,
};

function validatePhoneNumber(payload: {phone: string}) {
  return resolver(ENDPOINTS.phoneNumber(), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export {ENDPOINTS, validatePhoneNumber};

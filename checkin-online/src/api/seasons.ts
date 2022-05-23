import {resolver} from './index';

const ENDPOINTS = {
  all: (params = '') => `seasons/?${params}`,
  one: (id: string) => `seasons/${id}/`,
  links: () => `season-links/`,
  oneLink: (id: string) => `season-links/${id}/`,
};

function getOne(id: string) {
  return resolver(ENDPOINTS.one(id));
}

export {ENDPOINTS, getOne};

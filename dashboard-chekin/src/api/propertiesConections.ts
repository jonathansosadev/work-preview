import {resolver} from './index';
// base in locks.ts

// const customURL = 'http://4e5e-179-6-165-148.ngrok.io/api/v3/';

const ENDPOINTS = {
  propertiesProtectionsUsers: () => `hpi-integrations/superhog/users/`,
  getUser: (coreId:string) => `hpi-integrations/superhog/users/${coreId}/`,
  listings: (coreId:string) => `hpi-integrations/superhog/users/${coreId}/listings/`,
  mapHousings: (id:string = "") => `housings/hpi/superhog/${id}`,
};

function createPropertyProtectionUser(payload: any) {
  return resolver(ENDPOINTS.propertiesProtectionsUsers(), { 
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

function getUser(coreId:string) {
  return resolver(ENDPOINTS.getUser(coreId), { 
    method: 'GET'
  });
}

function getlistings(coreId: string, payload?:any) {
  const resolverObject: any = {
    ...(payload && {body: JSON.stringify(payload)}),
    method: payload ?'POST': 'GET'
  }
  return resolver(ENDPOINTS.listings(coreId), resolverObject);
}

function createOrUpdateMapHousings(payload:any) {
  let id:string = "";
  if (payload?.id) {
    id = payload.id;
  }

  return resolver(ENDPOINTS.mapHousings(id), {
    method: payload?.id ? 'PATCH': 'POST',
    body: JSON.stringify(payload),
  });
}

export {
  ENDPOINTS,
  createPropertyProtectionUser,
  getlistings,
  createOrUpdateMapHousings,
  getUser
};

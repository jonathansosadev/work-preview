import {resolver} from './index';

const ENDPOINTS = {
  templates: () => `import-xlsx/templates/`,
  import: () => `import-xlsx/import/`,
};

function getTemplates(payload = {}) {
  return resolver(ENDPOINTS.templates(), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

function uploadTemplates(payload = {}) {
  return resolver(ENDPOINTS.import(), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export {ENDPOINTS, getTemplates, uploadTemplates};

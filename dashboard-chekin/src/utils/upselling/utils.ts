import {OFFER_TEMPLATES} from './constants';

const WAIVO_TEMPLATES = [
  OFFER_TEMPLATES.waivo1500,
  OFFER_TEMPLATES.waivo2500,
  OFFER_TEMPLATES.waivo5000,
];

function checkTemplateIsWaivo(template?: OFFER_TEMPLATES) {
  if (!template) return false;
  return WAIVO_TEMPLATES.includes(template);
}

export {checkTemplateIsWaivo};

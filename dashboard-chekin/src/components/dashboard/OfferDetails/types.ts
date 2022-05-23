import {SelectOption} from 'utils/types';
import {PriceItemType} from '../OfferPriceSection/types';
import {
  EXTRA_PRICE_FORM_NAMES,
  FORM_NAMES,
  OFFER_CATEGORIES,
  OFFER_CONFIRM_TYPES,
  OFFER_TEMPLATES,
  PRICE_TYPES,
} from 'utils/upselling';
import {OfferPicture} from '../PictureLibraryModal/PictureLibraryModal';
import {State as AvailabilityState} from '../DurationPicker/DurationPicker';

export type FormTypes = {
  [FORM_NAMES.title]: string;
  [FORM_NAMES.highlight]: string;
  [FORM_NAMES.description]: string;
  [FORM_NAMES.priceType]: SelectOption<void, PRICE_TYPES>;
  [FORM_NAMES.pricesItems]: PriceItemType[];
  [FORM_NAMES.supplier]: SelectOption;
  [FORM_NAMES.confirmation_type]: SelectOption<void, OFFER_CONFIRM_TYPES>;
  [FORM_NAMES.category]: SelectOption<void, OFFER_CATEGORIES>;
  [FORM_NAMES.picture]: File | OfferPicture | undefined;
  [FORM_NAMES.spots]: string;
  [FORM_NAMES.duration]: AvailabilityState | undefined;
  [FORM_NAMES.selectedHousings]: SelectOption[] | undefined;
  [FORM_NAMES.template]: OFFER_TEMPLATES;
  [EXTRA_PRICE_FORM_NAMES.feeToGuest]?: string | number;
  [EXTRA_PRICE_FORM_NAMES.revenueToHost]?: string | number;
};

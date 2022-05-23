import {FORM_NAMES} from './constants';
import {SelectOption} from '../../../utils/types';

export type FormTypes = {
  [FORM_NAMES.name]: string;
  [FORM_NAMES.title]: string;
  [FORM_NAMES.text_format]: string;
  [FORM_NAMES.html_format]: string;
  [FORM_NAMES.country]?: SelectOption;
  [FORM_NAMES.extra_fields]?: Record<string, unknown>;
  [FORM_NAMES.force_save]?: boolean;
};

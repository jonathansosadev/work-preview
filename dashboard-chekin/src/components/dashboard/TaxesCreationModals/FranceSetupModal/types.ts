import {Dispatch, SetStateAction} from 'react';
import {InputEventType} from '../../../../utils/types';
import {FORM_NAMES, FORM_NAMES_FRANCE_TAXES} from '../../HousingTaxesSection';

export type StepProps = {
  goNextStep: () => void;
  goBackStep: () => void;
  inputValues: {[key: string]: string};
  setInputValues: Dispatch<SetStateAction<{[key: string]: string}>>;
  handleInputChange: (event: InputEventType) => void;
  handleCustomFieldChange: (
    name: FORM_NAMES | FORM_NAMES_FRANCE_TAXES,
    value: string,
  ) => void;
  onFinish: () => void;
};

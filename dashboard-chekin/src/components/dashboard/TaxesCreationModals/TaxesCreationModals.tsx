import React, {Dispatch, SetStateAction} from 'react';
import {InputEventType, SelectOption} from '../../../utils/types';
import {FORM_NAMES, FORM_NAMES_FRANCE_TAXES} from '../HousingTaxesSection';
import Modal from '../Modal';
import FranceSetupModal from './FranceSetupModal';
import CommonSetupModal from './CommonSetupModal';
import {Content} from './styled';

type TaxesCreationModalsProps = {
  open?: boolean;
  onClose: () => void;
  resetSeasons: () => void;
  resetExemptions: () => void;
  openImportTaxesModal: () => void;
  resetAgeCalculatorDefaultValuesAndCheckboxes: () => void;
  saveAgeCalculatorDefaultValues: () => void;
  handleInputChange: (event: InputEventType) => void;
  handleCustomFieldChange: (
    name: FORM_NAMES | FORM_NAMES_FRANCE_TAXES,
    value: string,
  ) => void;
  highSeasonDateRangePicker: React.ReactNode;
  lowSeasonDateRangePicker: React.ReactNode;
  ageCalculator: React.ReactNode;
  ageCalculatorWithoutSeasons: React.ReactNode;
  isHighSeasonDatesComplete: boolean;
  isLowSeasonDatesComplete: boolean;
  isAgeCalculatorNextButtonDisabled: boolean;
  inputValues: {[key: string]: string};
  setInputValues: Dispatch<SetStateAction<{[key: string]: string}>>;
  onFinish: () => void;
  exceptionsMultiSelect: React.ReactNode;
  exemptions: SelectOption[];
  isBookingPercentagePrice: boolean;
  setIsBookingPercentagePrice: Dispatch<SetStateAction<boolean>>;
  isCountryWithTaxesCalc: boolean;
  isDubaiCity: boolean;
  isFranceCountry: boolean;
};

function TaxesCreationModals(props: TaxesCreationModalsProps) {
  const {
    open,
    onClose,
    onFinish,
    handleInputChange,
    handleCustomFieldChange,
    inputValues,
    setInputValues,
    isFranceCountry,
  } = props;

  const SetupTaxesModal = React.useMemo(() => {
    if (isFranceCountry) {
      return (
        <FranceSetupModal
          handleInputChange={handleInputChange}
          inputValues={inputValues}
          setInputValues={setInputValues}
          handleCustomFieldChange={handleCustomFieldChange}
          onFinish={onFinish}
          onClose={onClose}
        />
      );
    }

    return <CommonSetupModal {...props} />;
  }, [
    handleCustomFieldChange,
    onFinish,
    onClose,
    handleInputChange,
    inputValues,
    isFranceCountry,
    props,
    setInputValues,
  ]);

  return (
    <Modal open={open}>
      <Content>{SetupTaxesModal}</Content>
    </Modal>
  );
}

export {TaxesCreationModals};

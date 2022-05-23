import React, {Dispatch, SetStateAction} from 'react';
import {useFormContext} from 'react-hook-form';
import {usePaymentSettings} from '../../../../hooks/usePaymentSettings';
import {AGE_CALCULATOR_FORM_NAMES, FORM_NAMES} from '../../HousingTaxesSection';
import {InputEventType, SelectOption} from '../../../../utils/types';
import backDisplayIcon from '../../../../assets/back-display-icn.svg';
import xIcon from '../../../../assets/x_blue.svg';
import {AgesStep, ExemptionsStep, FinishStep, PriceStep, SeasonsStep} from './steps';
import {BackButton, StepsNumber} from './styled';
import {CloseButton} from '../styled';

type CommonSetupModalProps = {
  open?: boolean;
  onClose: () => void;
  resetSeasons: () => void;
  resetExemptions: () => void;
  openImportTaxesModal: () => void;
  resetAgeCalculatorDefaultValuesAndCheckboxes: () => void;
  saveAgeCalculatorDefaultValues: () => void;
  handleInputChange: (event: InputEventType) => void;
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
function CommonSetupModal({
  open,
  onClose,
  handleInputChange,
  inputValues,
  setInputValues,
  onFinish,
  exceptionsMultiSelect,
  resetExemptions,
  exemptions,
  isCountryWithTaxesCalc,
  isDubaiCity,
  isFranceCountry,
  ageCalculator,
  saveAgeCalculatorDefaultValues,
  isAgeCalculatorNextButtonDisabled,
  ageCalculatorWithoutSeasons,
  isBookingPercentagePrice,
  ...restProps
}: CommonSetupModalProps) {
  const {trigger} = useFormContext();
  const [step, setStep] = React.useState(1);
  const [totalSteps, setTotalSteps] = React.useState(4);
  const [hasSeasons, setHasSeasons] = React.useState(false);
  const [isAskedForSeasons, setIsAskedForSeasons] = React.useState(false);
  const [hasAgeExceptions, setHasAgeExceptions] = React.useState(false);
  const [isWithoutSeasons, setIsWithoutSeasons] = React.useState(false);
  const [isAskedForPricePercentage, setIsAskedForPricePercentage] = React.useState(false);
  const {paymentSettingsCurrencyLabel} = usePaymentSettings();
  const isNeedShowBackButton = isAskedForSeasons || (isWithoutSeasons && step > 1);

  React.useLayoutEffect(
    function setStepsDependingCountry() {
      if (isDubaiCity) {
        setTotalSteps(2);
        setIsWithoutSeasons(true);
      }
    },
    [isDubaiCity],
  );

  React.useEffect(
    function revalidateAgeCalculatorOnMount() {
      if (step === 2 && isCountryWithTaxesCalc) {
        trigger(AGE_CALCULATOR_FORM_NAMES);
      }
    },
    [step, isCountryWithTaxesCalc, trigger],
  );

  const goBack = () => {
    setStep((prevState) => {
      if (prevState === 4) {
        return prevState - 1;
      }

      if (prevState === 3) {
        return prevState - 1;
      }

      if (prevState === 2) {
        if (hasAgeExceptions) {
          setHasAgeExceptions(false);
          return prevState;
        }

        if (isCountryWithTaxesCalc) {
          saveAgeCalculatorDefaultValues();

          setIsAskedForPricePercentage(false);
        }

        return prevState - 1;
      }

      if (step === 1) {
        if (isAskedForSeasons && isAskedForPricePercentage) {
          setIsAskedForPricePercentage(false);

          return prevState;
        }

        if (isAskedForSeasons && !isWithoutSeasons) {
          setIsAskedForSeasons(false);
          setHasSeasons(false);
        }
      }

      return prevState;
    });
  };

  const goNext = () => {
    setStep((prevState) => prevState + 1);
  };

  const saveDefaultFormValuesAndGoNext = React.useCallback(() => {
    saveAgeCalculatorDefaultValues();
    goNext();
  }, [saveAgeCalculatorDefaultValues]);

  const handleHasAgeExceptions = () => {
    setHasAgeExceptions(true);
  };

  const handleHasNoAgeExceptions = React.useCallback(() => {
    setInputValues((prevState) => {
      return {
        ...prevState,
        [FORM_NAMES.lessThanAge]: '',
      };
    });

    goNext();
  }, [setInputValues]);

  const handleNoExemptions = React.useCallback(() => {
    resetExemptions();
    goNext();
  }, [resetExemptions]);

  const StepsProps = React.useMemo(() => {
    return {
      france: {},
      seasons: {
        setInputValues,
        inputValues,
        isCountryWithTaxesCalc,
        setIsAskedForSeasons,
        setIsAskedForPricePercentage,
        isAskedForSeasons,
        isAskedForPricePercentage,
        hasSeasons,
        setHasSeasons,
        isBookingPercentagePrice,
        goNext,
        handleInputChange,
        ...restProps,
      },
      price: {
        goNext,
        handleInputChange,
        inputValues,
        isBookingPercentagePrice,
        currencyLabel: paymentSettingsCurrencyLabel,
      },
      exemptions: {
        exceptionsMultiSelect,
        exemptions,
        goNext,
        handleNoExemptions,
      },
      ages: {
        ageCalculator,
        ageCalculatorWithoutSeasons,
        isAgeCalculatorNextButtonDisabled,
        handleHasNoAgeExceptions,
        handleHasAgeExceptions,
        hasAgeExceptions,
        handleInputChange,
        inputValues,
        goNext,
        saveDefaultFormValuesAndGoNext,
        hasSeasons,
        isCountryWithTaxesCalc,
      },
      finish: {
        handleInputChange,
        inputValues,
        onFinish,
      },
    };
  }, [
    ageCalculator,
    ageCalculatorWithoutSeasons,
    exceptionsMultiSelect,
    exemptions,
    handleHasNoAgeExceptions,
    handleInputChange,
    handleNoExemptions,
    hasAgeExceptions,
    hasSeasons,
    inputValues,
    isAgeCalculatorNextButtonDisabled,
    isAskedForPricePercentage,
    isAskedForSeasons,
    isBookingPercentagePrice,
    isCountryWithTaxesCalc,
    onFinish,
    paymentSettingsCurrencyLabel,
    restProps,
    saveDefaultFormValuesAndGoNext,
    setInputValues,
  ]);

  const Steps = React.useMemo(() => {
    if (isDubaiCity) {
      return [<PriceStep {...StepsProps.price} />, <FinishStep {...StepsProps.finish} />];
    }

    return [
      <SeasonsStep {...StepsProps.seasons} />,
      <AgesStep {...StepsProps.ages} />,
      <ExemptionsStep {...StepsProps.exemptions} />,
      <FinishStep {...StepsProps.finish} />,
    ];
  }, [
    StepsProps.ages,
    StepsProps.exemptions,
    StepsProps.finish,
    StepsProps.price,
    StepsProps.seasons,
    isDubaiCity,
  ]);

  return (
    <div>
      <CloseButton type="button" onClick={onClose}>
        <img src={xIcon} alt="Cross" />
      </CloseButton>
      <StepsNumber>
        {isNeedShowBackButton && (
          <BackButton type="button" onClick={goBack}>
            <img src={backDisplayIcon} alt="Go back" />
          </BackButton>
        )}
        {step}/{totalSteps}
      </StepsNumber>
      {Steps[step - 1]}
    </div>
  );
}

export {CommonSetupModal};

import React, {Dispatch, SetStateAction} from 'react';
import {useTranslation} from 'react-i18next';
import {FORM_NAMES, FORM_NAMES_FRANCE_TAXES} from '../../HousingTaxesSection';
import {InputEventType} from '../../../../utils/types';
import xIcon from '../../../../assets/x_blue.svg';
import {CloseButton} from '../styled';
import {
  ClassificationStep,
  MunicipalTariffTaxStep,
  MunicipalPercentTaxStep,
  DepartamentalTaxStep,
  RegionTaxStep,
  FinishStep,
} from './steps';
import {TaxesStepper, Title, Wrapper} from './styled';

export const OfficialFranceTaxWebsite =
  'http://taxesejour.impots.gouv.fr/DTS_WEB/UK/index.awp';

type FranceSetupModalProps = {
  inputValues: {[key: string]: string};
  setInputValues: Dispatch<SetStateAction<{[key: string]: string}>>;
  handleInputChange: (event: InputEventType) => void;
  onFinish: () => void;
  onClose: () => void;
  handleCustomFieldChange: (
    name: FORM_NAMES | FORM_NAMES_FRANCE_TAXES,
    value: string,
  ) => void;
};
function FranceSetupModal(props: FranceSetupModalProps) {
  const {inputValues, onFinish, onClose} = props;
  const {t} = useTranslation();
  const totalSteps = 3;
  const [step, setStep] = React.useState<number>(0);
  const isFinishStep = step === 4;
  const isClassification = inputValues[FORM_NAMES_FRANCE_TAXES.isClassified] === '1';

  const goNextStep = React.useCallback(() => {
    setStep((prevStep) => ++prevStep);
  }, []);

  const goBackStep = React.useCallback(() => {
    setStep((prevStep) => {
      return prevStep <= 0 ? 0 : --prevStep;
    });
  }, []);

  const Steps = React.useMemo(() => {
    return [
      <ClassificationStep {...props} goNextStep={goNextStep} goBackStep={goBackStep} />,
      isClassification ? (
        <MunicipalTariffTaxStep
          {...props}
          goBackStep={goBackStep}
          goNextStep={goNextStep}
        />
      ) : (
        <MunicipalPercentTaxStep
          {...props}
          goBackStep={goBackStep}
          goNextStep={goNextStep}
        />
      ),
      <DepartamentalTaxStep {...props} goBackStep={goBackStep} goNextStep={goNextStep} />,
      <RegionTaxStep {...props} goBackStep={goBackStep} goNextStep={goNextStep} />,
      <FinishStep {...props} goBackStep={goBackStep} goNextStep={goNextStep} />,
    ];
  }, [goBackStep, goNextStep, isClassification, props]);

  const handleCloseModal = () => {
    return isFinishStep ? onFinish() : onClose();
  };

  return (
    <Wrapper>
      <CloseButton type="button" onClick={handleCloseModal}>
        <img src={xIcon} alt="Cross" />
      </CloseButton>
      {!isFinishStep && <Title>{t('tax_de_séjour')}</Title>}
      <TaxesStepper
        totalSteps={totalSteps}
        activeStep={step}
        visible={!!step && !isFinishStep}
      />
      {Steps[step]}
    </Wrapper>
  );
}

export {FranceSetupModal};

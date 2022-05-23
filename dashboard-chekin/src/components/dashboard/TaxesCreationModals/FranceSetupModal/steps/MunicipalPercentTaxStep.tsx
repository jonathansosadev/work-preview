import React from 'react';
import {useTranslation, Trans} from 'react-i18next';
import {FORM_NAMES_FRANCE_TAXES} from '../../../HousingTaxesSection';
import {InputEventType} from '../../../../../utils/types';
import {OfficialFranceTaxWebsite} from '../FranceSetupModal';
import {StepProps} from '../types';
import Input from 'components/dashboard/Input';
import Tooltip from '../../../Tooltip';
import {
  NextButton,
  BackButton,
  Subtitle,
  ButtonsWrapper,
  FormWrapper,
  TooltipButton,
  Link,
} from '../styled';

const MIN_PERCENT = 0;
const MAX_PERCENT = 100;

function MunicipalPercentTaxStep({
  goNextStep,
  goBackStep,
  inputValues,
  handleInputChange,
}: StepProps) {
  const {t} = useTranslation();
  const [error, setError] = React.useState<string | null>(null);
  const disabled =
    !!error || Boolean(!inputValues[FORM_NAMES_FRANCE_TAXES.municipalPercentage]);

  const validate = (value?: string) => {
    if (Number(value) < MIN_PERCENT) {
      return t('min_number', {number: MIN_PERCENT});
    }

    if (Number(value) > MAX_PERCENT) {
      return t('max_number', {number: MAX_PERCENT});
    }
  };

  const handleChange = (event: InputEventType) => {
    const error = validate(event.target.value);
    error ? setError(error) : setError(null);

    handleInputChange(event);
  };

  return (
    <div>
      <Subtitle>
        <Trans i18nKey="enter_municipal_percentage">
          <div>
            Enter <b>municipal percentage tax</b>
          </div>
        </Trans>
        <Tooltip
          trigger={<TooltipButton>({t('what_is_this')})</TooltipButton>}
          content={
            <Trans i18nKey="municipal_percentage_subtitle_tooltip">
              For properties that don’t have an official classification, instead of having
              a fixed municipal tariff, a calculation has to be made to define the tariff.
              <br />
              <br />
              This requires to set the “Municipal percentage tax” in order to make the
              calculation of the final tariff.
              <br />
              <br /> Not sure is the percentage in your municipality? Visit the{' '}
              <Link href={OfficialFranceTaxWebsite} target="_blank" rel="noreferrer">
                official Tax de Séjour website
              </Link>{' '}
              and search for your municipality.
            </Trans>
          }
        />
      </Subtitle>

      <FormWrapper>
        <Input
          value={String(inputValues[FORM_NAMES_FRANCE_TAXES.municipalPercentage])}
          onChange={handleChange}
          name={FORM_NAMES_FRANCE_TAXES.municipalPercentage}
          error={error}
          label={t('percentage_tax')}
          autoFocus={true}
          type="number"
          step="0.01"
          inputMode="decimal"
          sign="%"
        />
      </FormWrapper>
      <ButtonsWrapper>
        <NextButton disabled={disabled} label={t('next')} onClick={goNextStep} />
        <BackButton link label={t('back')} onClick={goBackStep} />
      </ButtonsWrapper>
    </div>
  );
}

export {MunicipalPercentTaxStep};

import React from 'react';
import {useTranslation} from 'react-i18next';
import {InputEventType} from '../../../../../utils/types';
import {FORM_NAMES} from '../../../HousingTaxesSection';
import {ShortInput} from '../../../HousingTaxesSection/styled';
import {
  Title,
  SubTitle,
  Button,
  TitleTooltip,
  NumberOfNightsWrapper,
  FinishButtonWrapper,
} from '../styled';

type FinishStepProps = {
  inputValues: {[key: string]: string};
  handleInputChange: (event: InputEventType) => void;
  onFinish: () => void;
};

function FinishStep({handleInputChange, inputValues, onFinish}: FinishStepProps) {
  const {t} = useTranslation();

  return (
    <div>
      <Title>
        {t('number_of_taxable_nights')}{' '}
        <TitleTooltip
          content={t('what_is_taxable_nights')}
          position="bottom"
          trigger={<span>({t('what_is_this')})</span>}
        />
      </Title>
      <SubTitle>
        {t('do_you_have_max_tax_nights')}
        <p />
        {t('if_not_click_finish')}
      </SubTitle>
      <NumberOfNightsWrapper>
        <ShortInput
          label={t('number_of_nights')}
          placeholder={t('enter_number')}
          type="number"
          inputMode="numeric"
          name={FORM_NAMES.maxNightsTaxed}
          value={inputValues[FORM_NAMES.maxNightsTaxed]}
          onChange={handleInputChange}
        />
      </NumberOfNightsWrapper>
      <FinishButtonWrapper>
        <Button label={t('finish')} onClick={onFinish} />
      </FinishButtonWrapper>
    </div>
  );
}

export {FinishStep};

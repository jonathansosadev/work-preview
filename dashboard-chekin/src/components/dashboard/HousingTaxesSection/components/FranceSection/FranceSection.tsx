import React from 'react';
import {useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {FORM_NAMES_FRANCE_TAXES} from '../../constants';
import {CURRENCIES_SYMBOL} from '../../../../../utils/constants';
import {ShortInput} from '../../styled';
import {FieldColumn, FieldTitle, Section, SelectorsStyled} from './styled';

const radioOptions = {
  yes: '1',
  no: '0',
};

const DepartamentalTaxOptions = {
  yes: FORM_NAMES_FRANCE_TAXES.hasDepartmentalTax,
  no: FORM_NAMES_FRANCE_TAXES.hasDepartmentalTax,
};

const RegionalTaxOptions = {
  yes: FORM_NAMES_FRANCE_TAXES.hasRegionTax,
  no: FORM_NAMES_FRANCE_TAXES.hasRegionTax,
};

type FranceSectionProps = {
  inputValues: {[key: string]: string};
  disabled?: boolean;
};
function FranceSection({inputValues, disabled}: FranceSectionProps) {
  const {t} = useTranslation();
  const {
    register,
    watch,
    formState: {errors},
  } = useFormContext();
  const isClassification = Boolean(watch(FORM_NAMES_FRANCE_TAXES.isClassified) === '1');

  return (
    <Section>
      {isClassification ? (
        <FieldColumn>
          <FieldTitle>{t('municipal_tariff')}</FieldTitle>
          <ShortInput
            {...register(FORM_NAMES_FRANCE_TAXES.municipalTariff, {
              required: t('required') as string,
            })}
            defaultValue={inputValues[FORM_NAMES_FRANCE_TAXES.municipalTariff]}
            error={errors[FORM_NAMES_FRANCE_TAXES.municipalTariff]?.message}
            label={t('tariff')}
            name={FORM_NAMES_FRANCE_TAXES.municipalTariff}
            step="0.01"
            inputMode="decimal"
            type="number"
            sign={CURRENCIES_SYMBOL.eur}
            readOnly={true}
            disabled={disabled}
          />
        </FieldColumn>
      ) : (
        <FieldColumn>
          <FieldTitle>{t('municipal_percentage_tax')}</FieldTitle>
          <ShortInput
            {...register(FORM_NAMES_FRANCE_TAXES.municipalPercentage, {
              required: t('required') as string,
            })}
            defaultValue={inputValues[FORM_NAMES_FRANCE_TAXES.municipalPercentage]}
            error={errors[FORM_NAMES_FRANCE_TAXES.municipalPercentage]?.message}
            label={t('percentage_tax')}
            name={FORM_NAMES_FRANCE_TAXES.municipalPercentage}
            step="0.01"
            inputMode="decimal"
            type="number"
            readOnly={true}
            sign="%"
            disabled={disabled}
          />
        </FieldColumn>
      )}
      <FieldColumn>
        <FieldTitle>{t('ten_percent_departamental_tax')}</FieldTitle>
        <SelectorsStyled
          label={t('applied')}
          selectorsFormNames={DepartamentalTaxOptions}
          disabled={disabled}
          radioValues={radioOptions}
          isTabType={true}
          readOnly={true}
        />
      </FieldColumn>
      <FieldColumn>
        <FieldTitle>{t('regional_tax_percent', {number: 15})}</FieldTitle>
        <SelectorsStyled
          label={t('applied')}
          selectorsFormNames={RegionalTaxOptions}
          disabled={disabled}
          radioValues={radioOptions}
          isTabType={true}
          readOnly={true}
        />
      </FieldColumn>
    </Section>
  );
}

export {FranceSection};

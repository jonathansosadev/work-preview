import React from 'react';
import {useTranslation} from 'react-i18next';
import {useFormContext} from 'react-hook-form';
import {DAY_NAMES} from '../../../utils/constants';
import {FORM_NAMES} from '../../../utils/upselling';
import {FormTypes} from '../OfferDetails/types';
import {State} from '../DurationPicker/DurationPicker';
import DurationPicker from '../DurationPicker';
import Section from '../Section';
import {InputController} from '../Input';
import {OptionName, Hr, StyledTooltip} from './styled';

type OfferAvailabilitySectionProps = {
  disabled: boolean;
  initState: State | undefined;
};

function OfferAvailabilitySection({disabled, initState}: OfferAvailabilitySectionProps) {
  const {t} = useTranslation();
  const {
    register,
    control,
    formState: {errors},
    setValue,
  } = useFormContext<FormTypes>();

  const removeTimeOptionsFromAvailabilityStateForPerformance = (state: State) => {
    const nextState = {...state};

    Object.keys(nextState).forEach((day) => {
      const dayName = day as DAY_NAMES;

      nextState[dayName] = {
        ...nextState[dayName],
        endOptions: [],
        startOptions: [],
      };
    });

    return nextState;
  };

  const handleDurationAvailabilityChange = (state: State) => {
    const nextStateWithoutTimeOptions = removeTimeOptionsFromAvailabilityStateForPerformance(
      state,
    );

    setValue(FORM_NAMES.duration, nextStateWithoutTimeOptions, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return (
    <Section title={t('availability')} subtitle={t('availability_subtitle')}>
      <OptionName>{t('by_duration')}</OptionName>
      <DurationPicker
        initState={initState}
        disabled={disabled}
        onChange={handleDurationAvailabilityChange}
        error={(errors[FORM_NAMES.duration] as any)?.message}
      />
      <Hr />
      <OptionName>
        {t('by_quantity')}
        <StyledTooltip content={t('deal_quantity_purpose')} trigger="(?)" />
      </OptionName>
      <InputController
        {...register(FORM_NAMES.spots)}
        control={control}
        disabled={disabled}
        type="number"
        inputMode="numeric"
        label={t('spots_available')}
        placeholder={t('enter_number')}
        error={errors[FORM_NAMES.spots]?.message}
      />
    </Section>
  );
}

export {OfferAvailabilitySection};

import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useQuery } from 'react-query';
import { useTranslation } from 'react-i18next';
import { useErrorToast } from '../../../utils/hooks';
import { getRequiredOrOptionalFieldLabel } from '../../../utils/common';
import { Housing, ReservationSource, SelectOption } from '../../../utils/types';
import api from '../../../api';
import { BookingSourcesFieldWrapper, BookingSourcesText } from './styled';
import CreatableMultiSelect from '../CreatableMultiSelect';

function getReservationSourcesAsOptions(sources?: ReservationSource[]): SelectOption[] {
  if (!sources) {
    return [];
  }


  return sources.map((source) => {
    return {
      value: source.id,
      label: source.name,
    };
  });
}

type BookingSourcesSubsectionProps = {
  formName: string;
  housing?: Housing;
  className?: string;
  onChange?: (value: SelectOption[] | undefined) => void;
  disabled?: boolean;
};

function ExemptSourcesSubsection({
  formName,
  onChange,
  housing,
  className,
  disabled,
}: BookingSourcesSubsectionProps) {
  const {t} = useTranslation();
  const {setValue, control} = useFormContext();

  const {data: reservationSources, error: reservationSourcesError} = useQuery<
    ReservationSource[]
  >('reservationSources', () => api.reservationSources.fetchReservationSources(), {
    refetchOnWindowFocus: false,
  });
  useErrorToast(reservationSourcesError, {
    notFoundMessage:
      'Requested reservation sources could not be found. Please contact support',
  });

  React.useEffect(
    function loadSources() {
      const exemptField = `${formName || ''}_nested` as keyof Housing;
      const sources = housing?.[exemptField] as ReservationSource[];

      if (!sources?.length) {
        return;
      }

      const sourcesOptions = getReservationSourcesAsOptions(sources);
      setValue(formName, sourcesOptions);
    },
    [formName, housing, setValue],
  );

  const reservationSourcesOptions = React.useMemo(() => {
    return getReservationSourcesAsOptions(reservationSources);
  }, [reservationSources]);

  return (
    <div className={className}>
      <BookingSourcesText>{t('booking_sources_text')}</BookingSourcesText>
      <BookingSourcesFieldWrapper>
        <Controller
          control={control}
          name={formName}
          render={({ field: { onChange: onValueChange, ...field } }) => {
            return (
              <CreatableMultiSelect
                width="471px;"
                options={reservationSourcesOptions}
                label={getRequiredOrOptionalFieldLabel(
                  t('exempted_booking_sources'),
                  false,
                )}
                placeholder={t('select_booking_sources')}
                disabled={disabled}
                onChange={(value:any) => {
                  if (onChange) {
                    onChange(value);
                  }

                  return onValueChange(value);
                }}
                {...field}
              />
            );
          }}
        />
      </BookingSourcesFieldWrapper>
    </div>
  );
}

export {ExemptSourcesSubsection};

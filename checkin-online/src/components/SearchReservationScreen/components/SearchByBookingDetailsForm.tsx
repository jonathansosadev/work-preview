import React from 'react';
import {Controller, useForm} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import moment from 'moment';
import {useIpDetails} from '../../../context/ipDetails';
import {getMinCheckInDate} from '../../../utils/common';
import {getFormattedDateOrFallback} from '../../ConfirmBookingDetailsForm/ConfirmBookingDetailsForm';
import {MOBILE_SEARCH_STEPS, SEARCH_RESERVATION_FORM_NAMES} from '../constants';
import {Status} from '../../../utils/types';
import {DATE_FORMAT} from '../../../utils/date';
import {FormTypes} from '../SearchReservationScreen';
import Input from '../../Input';
import {
  ButtonStyled,
  ConfirmButton,
  DatepickerInput,
  MobileAction,
  SearchForm,
} from '../styled';

type SearchByBookingDetailsFormProps = {
  onSearch: (
    payload: Omit<FormTypes, SEARCH_RESERVATION_FORM_NAMES.booking_reference>,
  ) => void;
  onChangeMobileStep: (step: MOBILE_SEARCH_STEPS) => () => void;
  setStatus: (status: Status) => void;
  isMobileMode: boolean;
  isLoading: boolean;
};
function SearchByBookingDetailsForm({
  onSearch,
  setStatus,
  isLoading,
  isMobileMode,
  onChangeMobileStep,
}: SearchByBookingDetailsFormProps) {
  const {t, i18n} = useTranslation();
  const {ipDetails} = useIpDetails();
  const {register, control, errors, handleSubmit, triggerValidation, formState} = useForm<
    FormTypes
  >();

  const searchExistingReservation = async (formData: FormTypes) => {
    setStatus('loading');
    const checkInDate = moment(
      formData[SEARCH_RESERVATION_FORM_NAMES.check_in_date],
    ).format(DATE_FORMAT);

    const payload = {
      [SEARCH_RESERVATION_FORM_NAMES.check_in_date]: checkInDate,
      [SEARCH_RESERVATION_FORM_NAMES.lead_email]:
        formData[SEARCH_RESERVATION_FORM_NAMES.lead_email],
    };
    onSearch(payload);
  };

  const validateCheckInDate = (value: string) => {
    const date = value || new Date();
    const minCheckInDate = getMinCheckInDate();
    const isAfterMinCheckInDate = moment(date).isSameOrAfter(minCheckInDate);
    if (isAfterMinCheckInDate) return true;

    const formatMinCheckInDate = getFormattedDateOrFallback({
      date: minCheckInDate.toDate(),
      ipCountry: ipDetails?.country_code,
    });
    return t(`minimum_check_in_date_is`, {date: formatMinCheckInDate});
  };

  React.useEffect(
    function changeTranslationErrorMessages() {
      if (formState.isSubmitted) {
        triggerValidation();
      }
    },
    [formState.isSubmitted, i18n.language, triggerValidation],
  );

  return (
    <SearchForm>
      <Controller
        rules={{required: `${t('required')}`, validate: validateCheckInDate}}
        control={control}
        as={
          <DatepickerInput
            disabled={isLoading}
            error={errors[SEARCH_RESERVATION_FORM_NAMES.check_in_date]?.message}
            label={t('check_in_date')}
          />
        }
        name={SEARCH_RESERVATION_FORM_NAMES.check_in_date}
      />
      <Input
        ref={register({
          required: `${t('required')}`,
        })}
        disabled={isLoading}
        name={SEARCH_RESERVATION_FORM_NAMES.lead_email}
        label={t('lead_guest_email')}
        placeholder={t('enter_email')}
        labelTooltip={t('lead_guest_email_tooltip')}
        error={errors[SEARCH_RESERVATION_FORM_NAMES.lead_email]?.message}
      />
      <ConfirmButton
        onClick={handleSubmit(searchExistingReservation)}
        type="submit"
        label={isLoading ? `${t('searching')}...` : t('continue')}
        disabled={isLoading}
      />
      {isMobileMode && (
        <MobileAction>
          <p>{t('or')}</p>
          <div>
            {t('find_my_booking_via')}
            <ButtonStyled
              label={t('booking_reference')}
              onClick={onChangeMobileStep(MOBILE_SEARCH_STEPS.bookingReference)}
              secondary
            />
          </div>
        </MobileAction>
      )}
    </SearchForm>
  );
}

export {SearchByBookingDetailsForm};

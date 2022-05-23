import React from 'react';
import {useForm} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {MOBILE_SEARCH_STEPS, SEARCH_RESERVATION_FORM_NAMES} from '../constants';
import {Status} from '../../../utils/types';
import {FormTypes} from '../SearchReservationScreen';
import Input from '../../Input';
import {ButtonStyled, ConfirmButton, MobileAction, SearchForm} from '../styled';

type SearchByBookingReferenceFormProps = {
  onSearch: (
    payload: Pick<FormTypes, SEARCH_RESERVATION_FORM_NAMES.booking_reference>,
  ) => void;
  onChangeMobileStep: (step: MOBILE_SEARCH_STEPS) => () => void;
  setStatus: (status: Status) => void;
  isMobileMode: boolean;
  isLoading: boolean;
};
function SearchByBookingReferenceForm({
  onSearch,
  onChangeMobileStep,
  setStatus,
  isMobileMode,
  isLoading,
}: SearchByBookingReferenceFormProps) {
  const {t, i18n} = useTranslation();
  const {register, errors, handleSubmit, triggerValidation, formState} = useForm<
    FormTypes
  >();

  const searchReservationByBookingReference = async (formData: FormTypes) => {
    setStatus('loading');
    const payload = {
      [SEARCH_RESERVATION_FORM_NAMES.booking_reference]:
        formData[SEARCH_RESERVATION_FORM_NAMES.booking_reference],
    };
    onSearch(payload);
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
      <Input
        ref={register({
          required: `${t('required')}`,
        })}
        name={SEARCH_RESERVATION_FORM_NAMES.booking_reference}
        label={t('booking_reference')}
        placeholder={t('enter_reference_code')}
        error={errors[SEARCH_RESERVATION_FORM_NAMES.booking_reference]?.message}
      />
      <ConfirmButton
        onClick={handleSubmit(searchReservationByBookingReference)}
        label={isLoading ? `${t('searching')}...` : t('continue')}
        disabled={isLoading}
      />
      {isMobileMode && (
        <MobileAction>
          <p>{t('or')}</p>

          <div>
            {t('find_my_booking_via')}
            <ButtonStyled
              label={t('checkin_date_and_email')}
              onClick={onChangeMobileStep(MOBILE_SEARCH_STEPS.dateAndEmail)}
              secondary
            />
          </div>
        </MobileAction>
      )}
    </SearchForm>
  );
}

export {SearchByBookingReferenceForm};

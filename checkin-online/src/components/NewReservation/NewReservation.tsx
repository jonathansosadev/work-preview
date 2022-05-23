import React from 'react';
import {useLocation, useHistory} from 'react-router-dom';
import {useForm, Controller} from 'react-hook-form';
import {isMobile} from 'react-device-detect';
import {useTranslation} from 'react-i18next';
import moment from 'moment';
import api from '../../api';
import {DATE_FORMAT} from '../../utils/date';
import {PATHS} from '../../Routes';
import {
  COUNTRY_CODES,
  SINGLE_GROUP_TYPES_OPTIONS,
  GROUP_GROUP_TYPES_OPTIONS,
  ALL_GROUP_TYPES_OPTIONS,
  TOURIST_GROUP_GROUP_TYPE_OPTION,
} from '../../utils/constants';
import {InputEventType, SelectOptionType} from '../../utils/types';
import {useStoredURLParams} from '../../context/storedURLParams';
import {useReservation} from '../../context/reservation';
import {useIpDetails} from '../../context/ipDetails';
import {getMinCheckInDate} from '../../utils/common';
import {getFormattedDateOrFallback} from '../ConfirmBookingDetailsForm/ConfirmBookingDetailsForm';
import Header from '../Header';
import Input from '../Input';
import Select from '../Select';
import {useErrorModal, useIsMounted, useStatus} from '../../utils/hooks';
import {
  Logo,
  Container,
  Wrapper,
  Title,
  ConfirmButton,
  DatepickerInput,
  VerticalLine,
  GoBackButton,
} from '../SearchReservationScreen/styled';
import {ReservationGrid, Form, Item} from './styled';

enum FORM_NAMES {
  lead_guest_name = 'default_leader_full_name',
  lead_email = 'default_invite_email',
  number_of_guests = 'number_of_guests',
  type_of_registration = 'type',
  check_in_date = 'check_in_date',
  check_out_date = 'check_out_date',
}

type LocationType = {
  l?: string;
  user?: string;
  housingId?: string;
  logo?: string;
  country?: string;
  startDate?: Date;
  endDate?: Date;
  email?: string;
};

type FormTypes = {
  [FORM_NAMES.lead_guest_name]: string;
  [FORM_NAMES.lead_email]: string;
  [FORM_NAMES.number_of_guests]: string | number;
  [FORM_NAMES.type_of_registration]: SelectOptionType;
  [FORM_NAMES.check_in_date]: Date;
  [FORM_NAMES.check_out_date]: Date;
};

function NewReservation() {
  const {t, i18n} = useTranslation();
  const location = useLocation<LocationType>();
  const history = useHistory();
  const {setNewReservationId} = useStoredURLParams();
  const {refreshReservation} = useReservation();
  const {ipDetails} = useIpDetails();
  const {
    setValue,
    register,
    triggerValidation,
    formState,
    watch,
    control,
    handleSubmit,
    errors,
  } = useForm<FormTypes>();
  const isMounted = useIsMounted();
  const {setStatus, isLoading} = useStatus();
  const {ErrorModal, displayError} = useErrorModal();
  const [groupTypes, setGroupTypes] = React.useState<SelectOptionType[]>(
    ALL_GROUP_TYPES_OPTIONS,
  );
  const [foundReservationId, setFoundReservationId] = React.useState('');
  const logo = location?.state?.logo;
  const country = location?.state?.country;
  const housing_id = location?.state?.housingId;
  const l = location?.state?.l;
  const user = location?.state?.user;
  const isTypeShown =
    country === COUNTRY_CODES.austria ||
    country === COUNTRY_CODES.uae ||
    country === COUNTRY_CODES.italy;
  const numberOfGuests = watch(FORM_NAMES.number_of_guests);
  const typeOfRegistration = watch(FORM_NAMES.type_of_registration);

  React.useEffect(
    function preloadKnowsFields() {
      setValue(FORM_NAMES.check_in_date, location?.state?.startDate);
      setValue(FORM_NAMES.check_out_date, location?.state?.endDate);
      setValue(FORM_NAMES.lead_email, location?.state?.email);
    },
    [location, setValue],
  );

  const revalidateFormField = async (name = '') => {
    if (formState.isSubmitted) {
      await triggerValidation(name);
    }
  };

  const handleInputChange = async (event: InputEventType) => {
    setValue(event.target.name, event.target.value);
    await revalidateFormField();
  };

  const handleInputDecrement = async (name = '') => {
    const value = watch(name);
    const minNumber = 0;

    if (Number(value) - 1 < minNumber) {
      setValue(name, '0');
      await revalidateFormField();
      return;
    }

    setValue(name, String(Number(watch(name)) - 1));
    await revalidateFormField();
  };

  const handleInputIncrement = async (name = '') => {
    const value = watch(name);
    const minNumber = 0;

    if (Number(value) + 1 < minNumber) {
      setValue(name, '0');
      await revalidateFormField();
      return;
    }

    setValue(name, String(Number(watch(name)) + 1));
    await revalidateFormField();
  };

  React.useEffect(
    function updateGroupTypesOnNumberOfGuestsChange() {
      let defaultAllGroupTypes = [...ALL_GROUP_TYPES_OPTIONS];
      if (country === COUNTRY_CODES.austria) {
        defaultAllGroupTypes.push(TOURIST_GROUP_GROUP_TYPE_OPTION);
      }
      if (numberOfGuests === undefined || numberOfGuests === '') {
        setGroupTypes(defaultAllGroupTypes);
        return;
      }

      let totalGuests = Number(numberOfGuests);
      totalGuests = totalGuests < 0 ? 0 : totalGuests;

      if (totalGuests > 1) {
        if (country === COUNTRY_CODES.austria) {
          setGroupTypes([...GROUP_GROUP_TYPES_OPTIONS, TOURIST_GROUP_GROUP_TYPE_OPTION]);
        } else {
          setGroupTypes(GROUP_GROUP_TYPES_OPTIONS);
        }
        return;
      }

      if (totalGuests > 0) {
        setGroupTypes(SINGLE_GROUP_TYPES_OPTIONS);
      }
    },
    [numberOfGuests, country],
  );

  React.useEffect(
    function keepCorrectRegistrationType() {
      if (!typeOfRegistration || !groupTypes.length) {
        return;
      }

      const hasSelectedGroupTypeOption = groupTypes.find(
        g => g?.value === typeOfRegistration?.value,
      );
      if (!hasSelectedGroupTypeOption) {
        setValue(FORM_NAMES.type_of_registration, undefined);
      }
    },
    [typeOfRegistration, groupTypes, setValue, triggerValidation],
  );

  const onSubmit = async (formData: FormTypes) => {
    setStatus('loading');
    const {number_of_guests, check_out_date, check_in_date, type, ...rest} = formData;
    const payload = {
      ...rest,
      [FORM_NAMES.check_in_date]: moment(check_in_date).format(DATE_FORMAT),
      [FORM_NAMES.check_out_date]: moment(check_out_date).format(DATE_FORMAT),
      guest_group: {
        number_of_guests,
        ...(type && {type: type.value}),
      },
      housing_id,
    };

    const {error, data} = await api.reservations.create(payload);

    if (!isMounted) return;

    if (data) {
      const reservationId = data.id;

      if (reservationId) {
        setNewReservationId(reservationId);
        setFoundReservationId(reservationId);
      }
    }

    if (error) {
      setStatus('error');
      displayError(error);
    }
  };

  React.useEffect(
    function fetchReservation() {
      if (foundReservationId) {
        const refetchReservationAndGo = async () => {
          await refreshReservation();
          setStatus('success');

          history.push(`/?reservation-id=${foundReservationId}&l=${l}&user=${user}`, {
            fromHousingFlow: true,
          });
        };

        refetchReservationAndGo();
      }
    },
    [foundReservationId, history, user, l, refreshReservation, setStatus],
  );

  React.useEffect(
    function changeTranslationErrorMessages() {
      if (formState.isSubmitted) {
        triggerValidation();
      }
    },
    [formState.isSubmitted, i18n.language, triggerValidation],
  );

  const handleGoBack = () => history.push(PATHS.searchReservation, location.state);

  const validateCheckInDate = (value: string) => {
    const date = value || new Date();
    const minCheckInDate = getMinCheckInDate(country);
    const isAfterMinCheckInDate = moment(date).isSameOrAfter(minCheckInDate);
    if (isAfterMinCheckInDate) return true;

    const formatMinCheckInDate = getFormattedDateOrFallback({
      date: minCheckInDate.toDate(),
      ipCountry: ipDetails?.country_code,
      housingCountry: country || '',
    });
    return t(`minimum_check_in_date_is`, {date: formatMinCheckInDate});
  };

  return (
    <div>
      <Header hideBackButton />
      <Container>
        <Wrapper>
          {logo && <Logo src={logo} alt="random" />}
          <Title>{t('reservation_details')}</Title>
          <Form>
            <ReservationGrid>
              <Item>
                <Controller
                  name={FORM_NAMES.check_in_date}
                  control={control}
                  rules={{
                    required: `${t('required')}`,
                    validate: validateCheckInDate,
                  }}
                  as={
                    <DatepickerInput
                      disabled={isLoading}
                      error={errors[FORM_NAMES.check_in_date]?.message}
                      label={t('check_in_date')}
                    />
                  }
                />
                <Controller
                  name={FORM_NAMES.check_out_date}
                  control={control}
                  rules={{required: `${t('required')}`}}
                  as={
                    <DatepickerInput
                      disabled={isLoading}
                      error={errors[FORM_NAMES.check_out_date]?.message}
                      label={t('check_out_date')}
                    />
                  }
                />
                <Input
                  type="number"
                  ref={register({
                    required: `${t('required')}`,
                  })}
                  disabled={isLoading}
                  name={FORM_NAMES.number_of_guests}
                  label={t('guest_to_register')}
                  placeholder={isMobile ? t('enter_number') : t('enter_number_of_guests')}
                  onChange={handleInputChange}
                  onDecrement={() => handleInputDecrement(FORM_NAMES.number_of_guests)}
                  onIncrement={() => handleInputIncrement(FORM_NAMES.number_of_guests)}
                  value={watch(FORM_NAMES.number_of_guests)}
                  error={errors[FORM_NAMES.number_of_guests]?.message}
                />
              </Item>
              <Item>
                <VerticalLine />
              </Item>
              <Item>
                <Input
                  ref={register({
                    required: `${t('required')}`,
                  })}
                  disabled={isLoading}
                  name={FORM_NAMES.lead_guest_name}
                  label={t('lead_guest_name')}
                  placeholder={t('enter_name')}
                  error={errors[FORM_NAMES.lead_guest_name]?.message}
                />

                {isTypeShown && (
                  <Controller
                    as={<Select />}
                    control={control}
                    label={t('type_of_registration')}
                    options={groupTypes}
                    rules={{required: `${t('required')}`}}
                    name={FORM_NAMES.type_of_registration}
                    disabled={isLoading}
                    placeholder={t('select_your_type_of_registration')}
                    error={(errors[FORM_NAMES.type_of_registration] as any)?.message}
                  />
                )}
                <Input
                  ref={register({
                    required: `${t('required')}`,
                  })}
                  disabled={isLoading}
                  name={FORM_NAMES.lead_email}
                  label={t('lead_guest_email')}
                  placeholder={t('enter_email')}
                  labelTooltip={t('lead_guest_email_tooltip')}
                  error={errors[FORM_NAMES.lead_email]?.message}
                />
              </Item>
            </ReservationGrid>
            <ConfirmButton
              label={isLoading ? `${t('creating')}...` : t('confirm')}
              disabled={isLoading}
              onClick={handleSubmit(onSubmit)}
            />
            <GoBackButton onClick={handleGoBack} label={t('go_back')} secondary />
          </Form>
        </Wrapper>
      </Container>
      <ErrorModal />
    </div>
  );
}

export {NewReservation};

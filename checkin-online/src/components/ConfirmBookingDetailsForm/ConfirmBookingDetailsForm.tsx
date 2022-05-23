import React from 'react';
import {useTranslation} from 'react-i18next';
import {Location} from 'history';
import {useHistory, useLocation} from 'react-router-dom';
import {format} from 'date-fns';
import {useForm} from 'react-hook-form';
import {
  getCheckInDate,
  getCheckOutDate,
  getHousingCountryCode,
  getNumberOfGuests,
} from '../../utils/reservation';
import {useComputedReservationDetails} from '../../context/computedReservationDetails';
import {InputEventType, valueof} from '../../utils/types';
import {COUNTRY_CODES} from '../../utils/constants';
import {useIpDetails} from '../../context/ipDetails';
import Input from '../Input';
import ShortInput from '../ShortInput';
import Button from '../Button';
import {FormFieldWrapper} from '../../styled/common';
import {Wrapper, CheckDatesContainer, Form, SubmitButtonWrapper} from './styled';

type MinInputNumbersType = {
  readonly [key: string]: number;
};

export enum FORM_NAMES {
  children = 'children',
  numberOfGuests = 'number_of_guests',
}

const MIN_INPUT_NUMBERS: MinInputNumbersType = {
  [FORM_NAMES.children]: 0,
  [FORM_NAMES.numberOfGuests]: 1,
};

const MIN_CHILDREN_RESTRICTION_AGE: {[key in valueof<typeof COUNTRY_CODES>]: string} = {
  [COUNTRY_CODES.france]: '15',
  [COUNTRY_CODES.spain]: '14',
  [COUNTRY_CODES.usa]: '18',
  [COUNTRY_CODES.uk]: '16',
};

type FormTypes = {
  [FORM_NAMES.numberOfGuests]: number;
  [FORM_NAMES.children]: number;
};

type FormatDate = {
  date: Date;
  housingCountry?: string;
  ipCountry?: string;
};
function formatDate({date, housingCountry, ipCountry}: FormatDate) {
  if (housingCountry === COUNTRY_CODES.usa || ipCountry === COUNTRY_CODES.usa) {
    return format(date, 'MM/dd/yyyy');
  }

  return format(date, 'dd-MM-yyyy');
}

type GetFormattedDateOrFallback = {
  date: Date | null;
  housingCountry?: string;
  ipCountry?: string;
};
function getFormattedDateOrFallback({date = null, ...props}: GetFormattedDateOrFallback) {
  if (!date) {
    return '';
  }
  return formatDate({...props, date});
}

function getPersistedNumberOfGuests(location: Location<FormTypes>): number | null {
  const numberOfGuests = location?.state?.[FORM_NAMES.numberOfGuests];

  if (!numberOfGuests) {
    return null;
  }
  return numberOfGuests;
}

function getInitChildren(location: Location<FormTypes>): number {
  const children = location?.state?.children;

  if (!children) {
    return MIN_INPUT_NUMBERS.children;
  }
  return children;
}

const INIT_DISPLAY_FIELDS = {
  isAdultsFieldVisible: true,
  isChildrenFieldVisible: false,
};
function getDisplayFields(reservation: any = {}) {
  const countryCode = getHousingCountryCode(reservation);

  switch (countryCode) {
    case COUNTRY_CODES.france:
    case COUNTRY_CODES.spain:
    case COUNTRY_CODES.usa:
    case COUNTRY_CODES.uk: {
      return {
        ...INIT_DISPLAY_FIELDS,
        isChildrenFieldVisible: true,
      };
    }
    default: {
      return INIT_DISPLAY_FIELDS;
    }
  }
}

function getMinimumChildrenRestrictionAge(reservation: any = {}) {
  const countryCode = getHousingCountryCode(reservation);
  return MIN_CHILDREN_RESTRICTION_AGE[countryCode] || '';
}

function ConfirmBookingDetailsForm() {
  const {t} = useTranslation();
  const history = useHistory();
  const location = useLocation<FormTypes | any>();
  const {
    reservation,
    isDocScanDisabled,
    isVerifyDocumentAndSelfie,
  } = useComputedReservationDetails();
  const [displayFields, setDisplayFields] = React.useState(() => {
    return getDisplayFields(reservation);
  });
  const initChildrenNumber = getInitChildren(location);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    errors,
    triggerValidation,
    formState,
  } = useForm<FormTypes>({
    defaultValues: {
      [FORM_NAMES.numberOfGuests]:
        getPersistedNumberOfGuests(location) ||
        getNumberOfGuests(reservation, MIN_INPUT_NUMBERS.number_of_guests),
      children: initChildrenNumber,
    },
    submitFocusError: false,
  });
  const {ipDetails} = useIpDetails();

  const housingCountry = getHousingCountryCode(reservation);
  const checkInDate = getCheckInDate(reservation);
  const checkOutDate = getCheckOutDate(reservation);
  const numberOfGuestsLabel = displayFields.isChildrenFieldVisible
    ? t('adults')
    : t(FORM_NAMES.numberOfGuests);

  React.useEffect(() => {
    const displayFields = getDisplayFields(reservation);
    setDisplayFields(displayFields);

    setValue(FORM_NAMES.numberOfGuests, getNumberOfGuests(reservation));
  }, [reservation, setValue]);

  React.useEffect(() => {
    if (displayFields.isAdultsFieldVisible) {
      register(FORM_NAMES.numberOfGuests, {
        required: t('required') as string,
        validate: value =>
          Number(value) >= MIN_INPUT_NUMBERS.number_of_guests ||
          (t('min_number_is', {number: MIN_INPUT_NUMBERS.number_of_guests}) as string),
      });
    }

    if (displayFields.isChildrenFieldVisible) {
      register(FORM_NAMES.children, {
        required: t('required') as string,
        validate: value =>
          Number(value) >= MIN_INPUT_NUMBERS.children ||
          (t('min_number_is', {number: MIN_INPUT_NUMBERS.children}) as string),
      });
      setValue(FORM_NAMES.children, initChildrenNumber);
    }
  }, [register, t, displayFields, setValue, initChildrenNumber]);

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
    const minNumber = MIN_INPUT_NUMBERS[name] || 0;

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
    const minNumber = MIN_INPUT_NUMBERS[name] || 0;

    if (Number(value) + 1 < minNumber) {
      setValue(name, '0');
      await revalidateFormField();
      return;
    }

    setValue(name, String(Number(watch(name)) + 1));
    await revalidateFormField();
  };

  const getPersistedState = React.useCallback(
    (payload: FormTypes) => {
      return {
        ...location.state,
        ...payload,
      };
    },
    [location.state],
  );

  const onSubmit = React.useCallback(
    (data: FormTypes) => {
      const state = getPersistedState(data);

      if (isVerifyDocumentAndSelfie) {
        return history.push('/verification/guide', state);
      }

      if (isDocScanDisabled) {
        history.push('/form/add', state);
        return;
      }
      history.push('/form/type', state);
    },
    [getPersistedState, isVerifyDocumentAndSelfie, history, isDocScanDisabled],
  );

  React.useLayoutEffect(
    function handleIsFromHousingFlow() {
      const shouldSkipConfirmScreen =
        location?.state?.fromHousingFlow && !displayFields.isChildrenFieldVisible;

      if (shouldSkipConfirmScreen) {
        handleSubmit(onSubmit)();
      }
    },
    [
      handleSubmit,
      location,
      location.state,
      onSubmit,
      displayFields.isChildrenFieldVisible,
    ],
  );

  return (
    <Wrapper>
      <CheckDatesContainer>
        <ShortInput
          disabled
          value={getFormattedDateOrFallback({
            date: checkInDate,
            ipCountry: ipDetails?.country_code,
            housingCountry,
          })}
          label={t('check_in_date')}
          name="check_in_date"
        />
        <ShortInput
          disabled
          value={getFormattedDateOrFallback({
            date: checkOutDate,
            ipCountry: ipDetails?.country_code,
            housingCountry,
          })}
          label={t('check_out_date')}
          name="check_out_date"
        />
      </CheckDatesContainer>
      <Form onSubmit={handleSubmit(onSubmit)}>
        {displayFields.isAdultsFieldVisible && !location?.state?.fromHousingFlow && (
          <FormFieldWrapper
            hasError={Boolean((errors?.[FORM_NAMES.numberOfGuests] as any)?.message)}
          >
            <Input
              type="number"
              label={numberOfGuestsLabel}
              onChange={handleInputChange}
              onDecrement={() => handleInputDecrement(FORM_NAMES.numberOfGuests)}
              onIncrement={() => handleInputIncrement(FORM_NAMES.numberOfGuests)}
              value={watch(FORM_NAMES.numberOfGuests)}
              error={(errors?.[FORM_NAMES.numberOfGuests] as any)?.message as string}
              name="number_of_guests"
            />
          </FormFieldWrapper>
        )}
        {displayFields.isChildrenFieldVisible && (
          <FormFieldWrapper hasError={Boolean(errors?.children?.message)}>
            <Input
              type="number"
              label={t('children_under_number', {
                number: getMinimumChildrenRestrictionAge(reservation),
              })}
              onChange={handleInputChange}
              onDecrement={() => handleInputDecrement(FORM_NAMES.children)}
              onIncrement={() => handleInputIncrement(FORM_NAMES.children)}
              value={
                watch(FORM_NAMES.children) === undefined
                  ? initChildrenNumber
                  : watch(FORM_NAMES.children)
              }
              error={errors?.children?.message as string}
              name="children"
            />
          </FormFieldWrapper>
        )}
        <SubmitButtonWrapper>
          <Button type="submit" label={t('next')} />
        </SubmitButtonWrapper>
      </Form>
    </Wrapper>
  );
}

export {ConfirmBookingDetailsForm, getFormattedDateOrFallback, MIN_INPUT_NUMBERS};

import React from 'react';
import {useParams} from 'react-router-dom';
import {Controller, useForm} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import Datepicker from '../Datepicker';
import i18n from '../../../i18n';
import {DatepickerDate, SelectOption} from '../../../utils/types';
import {getRequiredOrOptionalFieldLabel} from '../../../utils/common';
import {AJPES_MONTHLY_REPORT_STATUSES_OPTION} from '../../../utils/constants';
import Button from '../Button';
import Loader from '../../common/Loader';
import moment from 'moment';
import {useHistory} from 'react-router-dom';
import {useStatus} from '../../../utils/hooks';
import api from '../../../api';
import {useErrorModal} from '../../../utils/hooks';
import {toast} from 'react-toastify';
import ModalButton from '../ModalButton';
import Select from '../Select';
import {REPORT_TYPES} from '../../../utils/constants';
import {InputController} from '../Input';
import {FieldWrapper, Form, Wrapper, ButtonWrapper} from './styled';

enum FORM_NAMES {
  totalBeds = 'totalBeds',
  totalRooms = 'totalRooms',
  clousureDate = 'clousureDate',
  reopeningDate = 'reopeningDate',
  deregestrationDate = 'deregestrationDate',
  extraBeds = 'extraBeds',
  sold = 'sold',
  daysOpen = 'daysOpen',
  status = 'status',
}

type Boundaries = {
  max: moment.Moment;
  min: moment.Moment;
};

type FormTypes = Partial<{
  [FORM_NAMES.totalBeds]: number;
  [FORM_NAMES.totalRooms]: number;
  [FORM_NAMES.clousureDate]: DatepickerDate;
  [FORM_NAMES.reopeningDate]: DatepickerDate;
  [FORM_NAMES.deregestrationDate]: DatepickerDate;
  [FORM_NAMES.extraBeds]: number;
  [FORM_NAMES.sold]: number;
  [FORM_NAMES.daysOpen]: number;
  [FORM_NAMES.status]: SelectOption;
}>;

const INIT_REQUIRED_FIELDS = {
  [FORM_NAMES.totalBeds]: i18n.t('required') as string,
  [FORM_NAMES.totalRooms]: i18n.t('required') as string,
  [FORM_NAMES.clousureDate]: false,
  [FORM_NAMES.reopeningDate]: false,
  [FORM_NAMES.deregestrationDate]: false,
  [FORM_NAMES.extraBeds]: i18n.t('required') as string,
  [FORM_NAMES.sold]: i18n.t('required') as string,
  [FORM_NAMES.daysOpen]: i18n.t('required') as string,
  [FORM_NAMES.status]: i18n.t('required') as string,
};

function getRequiredFields() {
  return INIT_REQUIRED_FIELDS;
}

const INIT_DISPLAY_FIELDS = {
  [FORM_NAMES.totalBeds]: true,
  [FORM_NAMES.totalRooms]: true,
  [FORM_NAMES.clousureDate]: true,
  [FORM_NAMES.reopeningDate]: true,
  [FORM_NAMES.deregestrationDate]: true,
  [FORM_NAMES.extraBeds]: false,
  [FORM_NAMES.sold]: false,
  [FORM_NAMES.daysOpen]: false,
  [FORM_NAMES.status]: false,
};

function getDisplayFields(type = '') {
  switch (type) {
    case REPORT_TYPES.idev: {
      return INIT_DISPLAY_FIELDS;
    }

    case REPORT_TYPES.ajpes: {
      return {
        [FORM_NAMES.totalBeds]: false,
        [FORM_NAMES.totalRooms]: false,
        [FORM_NAMES.clousureDate]: false,
        [FORM_NAMES.reopeningDate]: false,
        [FORM_NAMES.deregestrationDate]: false,
        [FORM_NAMES.extraBeds]: true,
        [FORM_NAMES.sold]: true,
        [FORM_NAMES.daysOpen]: true,
        [FORM_NAMES.status]: true,
      };
    }

    default:
      return INIT_DISPLAY_FIELDS;
  }
}

function getFields(type = '') {
  const display = getDisplayFields(type);
  const required = getRequiredFields();

  return {display, required};
}

function getBoundariesFromUrl(year = '', month = '', history: any) {
  const activeMonthDate = moment(`${year}-${month}-01`);
  const isDateValid = moment(activeMonthDate).clone().isValid();

  if (!year || !month || !isDateValid) {
    history.replace('/bookings');
  }

  const maxDate = activeMonthDate.clone().endOf('month');
  const minDate = activeMonthDate.clone().startOf('month');

  const boundaries = {
    max: maxDate,
    min: minDate,
  };

  return boundaries;
}

function validateBeds(value = 0, rooms: unknown = 0) {
  if (Number(value) < Number(rooms)) {
    return i18n.t('beds_cant_be_less_than_rooms');
  }

  return true;
}

function validateClosureDate(value: DatepickerDate, boundaries: Boundaries) {
  const hasValue = value !== undefined;
  if (!hasValue) {
    return true;
  }

  const maxDate = moment(boundaries.max).format('YYYY-MM-DD');
  const minDate = moment(boundaries.min).format('YYYY-MM-DD');
  const closureDate = moment(value).format('YYYY-MM-DD');

  const isValid = moment(closureDate).isBetween(minDate, maxDate);

  if (isValid) {
    return true;
  }

  return i18n.t('clousure_date_error');
}

function validateReopeningDate(
  value: DatepickerDate,
  clousureDate: Date,
  boundaries: Boundaries,
) {
  const hasValue = value !== undefined;
  if (!hasValue) {
    return true;
  }

  const hasClosureDate = clousureDate !== undefined;
  if (hasClosureDate) {
    const minDate = moment(clousureDate).format('YYYY-MM-DD');
    const reopeningDate = moment(value).format('YYYY-MM-DD');
    const isValid = moment(reopeningDate).isAfter(minDate);

    if (isValid) {
      return true;
    }

    return i18n.t('reopening_date_cannot_be_before_closure_date');
  }

  const minDate = moment(boundaries.min).format('YYYY-MM-DD');
  const reopeningDate = moment(value).format('YYYY-MM-DD');
  const isValid = moment(reopeningDate).isAfter(minDate);

  if (isValid) {
    return true;
  }

  return i18n.t('reopen_before_range_error');
}

function MonthlyReportForm() {
  const {monthReportType, housingId, year, month} = useParams<any>();
  const {t} = useTranslation();
  const history = useHistory();
  const [fields] = React.useState(() => getFields(monthReportType));
  const boundaries = getBoundariesFromUrl(year, month, history);
  const {formState, control, register, getValues, trigger, handleSubmit} = useForm<
    FormTypes
  >({
    shouldUnregister: true,
  });

  const {errors} = formState;

  const {displayError, ErrorModal} = useErrorModal();
  const {setStatus, isLoading} = useStatus();

  React.useEffect(
    function validateForm() {
      if (formState.isSubmitted) {
        trigger();
      }
    },
    [trigger, fields, formState.isSubmitted],
  );

  const getIdevPayload = (data: FormTypes) => {
    const closureDate = data.clousureDate
      ? moment(data.clousureDate).format('YYYY-MM-DD')
      : undefined;
    const reopeningDate = data.reopeningDate
      ? moment(data.reopeningDate).format('YYYY-MM-DD')
      : undefined;
    const deregestrationDate = data.deregestrationDate
      ? moment(data.deregestrationDate).format('YYYY-MM-DD')
      : undefined;

    return {
      closure_date: {
        closure_date: closureDate,
        reopening_date: reopeningDate,
      },
      deregistration_date: deregestrationDate,
      rooms_quantity: data.totalRooms,
      beds_quantity: data.totalBeds,
    };
  };

  const getAjpesPayload = (data: FormTypes) => {
    return {
      sold: data.sold,
      extra_beds: data.extraBeds,
      days_open: data.daysOpen,
      status: data.status?.value,
      housing_id: housingId,
    };
  };

  const sendIdevPayload = async (data: FormTypes) => {
    setStatus('loading');

    const payload = getIdevPayload(data);
    const {error} = await api.housings.patchById(housingId, payload);

    setStatus('idle');

    if (error) {
      displayError(error);
      return;
    }

    history.push('/bookings');
  };

  const sendAjpesPayload = async (data: FormTypes) => {
    setStatus('loading');

    const payload = getAjpesPayload(data);
    const {error} = await api.housings.sendAjpesMonthlyReportTask(payload);

    setStatus('idle');

    if (error) {
      displayError(error);
      return;
    }

    history.push('/bookings');
  };

  const onSubmit = async (data: FormTypes) => {
    if (monthReportType === REPORT_TYPES.idev) {
      await sendIdevPayload(data);
      return;
    }

    if (monthReportType === REPORT_TYPES.ajpes) {
      await sendAjpesPayload(data);
      return;
    }

    toast.error('Unsupported report type. Please contact support');
  };

  return (
    <Wrapper>
      <Form onSubmit={handleSubmit(onSubmit)}>
        {fields.display[FORM_NAMES.totalBeds] && (
          <FieldWrapper>
            <InputController
              label={getRequiredOrOptionalFieldLabel(
                t('total_beds'),
                fields.required[FORM_NAMES.totalBeds],
              )}
              placeholder={t('beds_number')}
              {...register(FORM_NAMES.totalBeds, {
                required: fields.required[FORM_NAMES.totalBeds],
                validate: (value) =>
                  validateBeds(value, getValues()[FORM_NAMES.totalRooms]) as
                    | string
                    | boolean,
              })}
              control={control}
              error={errors[FORM_NAMES.totalBeds]?.message}
              type="number"
            />
          </FieldWrapper>
        )}
        {fields.display[FORM_NAMES.totalRooms] && (
          <FieldWrapper>
            <InputController
              label={getRequiredOrOptionalFieldLabel(
                t('total_rooms'),
                fields.required[FORM_NAMES.totalRooms],
              )}
              placeholder={t('rooms_number')}
              {...register(FORM_NAMES.totalRooms, {
                required: fields.required[FORM_NAMES.totalRooms],
              })}
              control={control}
              error={errors[FORM_NAMES.totalRooms]?.message}
              type="number"
            />
          </FieldWrapper>
        )}
        {fields.display[FORM_NAMES.clousureDate] && (
          <FieldWrapper>
            <Controller
              control={control}
              name={FORM_NAMES.clousureDate}
              rules={{
                required: fields.required[FORM_NAMES.clousureDate],
                validate: (value) => validateClosureDate(value, boundaries),
              }}
              render={({field, fieldState: {error}}) => {
                return (
                  <Datepicker
                    label={getRequiredOrOptionalFieldLabel(
                      t('clousure_date'),
                      fields.required[FORM_NAMES.clousureDate],
                    )}
                    error={error?.message}
                    {...field}
                  />
                );
              }}
            />
          </FieldWrapper>
        )}
        {fields.display[FORM_NAMES.reopeningDate] && (
          <FieldWrapper>
            <Controller
              control={control}
              name={FORM_NAMES.reopeningDate}
              rules={{
                required: fields.required[FORM_NAMES.reopeningDate],
                validate: (value) =>
                  validateReopeningDate(
                    value,
                    getValues()[FORM_NAMES.clousureDate] as Date,
                    boundaries,
                  ),
              }}
              render={({field, fieldState: {error}}) => {
                return (
                  <Datepicker
                    label={getRequiredOrOptionalFieldLabel(
                      t('reopening_date'),
                      fields.required[FORM_NAMES.reopeningDate],
                    )}
                    error={error?.message}
                    {...field}
                  />
                );
              }}
            />
          </FieldWrapper>
        )}
        {fields.display[FORM_NAMES.deregestrationDate] && (
          <FieldWrapper>
            <Controller
              control={control}
              name={FORM_NAMES.deregestrationDate}
              rules={{
                required: fields.required[FORM_NAMES.deregestrationDate],
              }}
              render={({field, fieldState: {error}}) => {
                return (
                  <Datepicker
                    label={getRequiredOrOptionalFieldLabel(
                      t('deregestation_date'),
                      fields.required[FORM_NAMES.deregestrationDate],
                    )}
                    error={error?.message}
                    {...field}
                  />
                );
              }}
            />
          </FieldWrapper>
        )}

        {fields.display[FORM_NAMES.extraBeds] && (
          <FieldWrapper>
            <InputController
              label={getRequiredOrOptionalFieldLabel(
                t('extra_beds'),
                fields.required[FORM_NAMES.extraBeds],
              )}
              placeholder={t('enter_number')}
              {...register(FORM_NAMES.extraBeds, {
                required: fields.required[FORM_NAMES.extraBeds],
              })}
              control={control}
              error={errors[FORM_NAMES.extraBeds]?.message}
              type="number"
            />
          </FieldWrapper>
        )}

        {fields.display[FORM_NAMES.sold] && (
          <FieldWrapper>
            <InputController
              label={getRequiredOrOptionalFieldLabel(
                t('sold'),
                fields.required[FORM_NAMES.sold],
              )}
              placeholder={t('enter_number')}
              {...register(FORM_NAMES.sold, {
                required: fields.required[FORM_NAMES.sold],
              })}
              control={control}
              error={errors[FORM_NAMES.sold]?.message}
              type="number"
            />
          </FieldWrapper>
        )}

        {fields.display[FORM_NAMES.daysOpen] && (
          <FieldWrapper>
            <InputController
              label={getRequiredOrOptionalFieldLabel(
                t('days_open'),
                fields.required[FORM_NAMES.daysOpen],
              )}
              placeholder={t('enter_number')}
              {...register(FORM_NAMES.daysOpen, {
                required: fields.required[FORM_NAMES.daysOpen],
              })}
              control={control}
              error={errors[FORM_NAMES.daysOpen]?.message}
              type="number"
            />
          </FieldWrapper>
        )}

        {fields.display[FORM_NAMES.status] && (
          <>
            <FieldWrapper>
              <Controller
                control={control}
                name={FORM_NAMES.status}
                rules={{required: fields.required[FORM_NAMES.status]}}
                render={({field, fieldState: {error}}) => {
                  return (
                    <Select
                      label={getRequiredOrOptionalFieldLabel(
                        t('status'),
                        fields.required[FORM_NAMES.status],
                      )}
                      options={AJPES_MONTHLY_REPORT_STATUSES_OPTION}
                      error={error?.message}
                      {...field}
                    />
                  );
                }}
              />
            </FieldWrapper>
          </>
        )}

        <ButtonWrapper>
          {isLoading ? <Loader /> : <Button label={t('confirm')} type="submit" />}
        </ButtonWrapper>
      </Form>
      <ErrorModal>
        <ModalButton
          onClick={() => history.push('/bookings')}
          label={t('go_to_bookings')}
        />
      </ErrorModal>
    </Wrapper>
  );
}

export {MonthlyReportForm};

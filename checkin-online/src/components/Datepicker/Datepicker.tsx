import React from 'react';
import {useTranslation} from 'react-i18next';
import i18n from '../../i18n';
import {getDate, getMonth, getYear, isValid} from 'date-fns';
import {DatepickerDateType, InputEventType, SelectOptionType} from '../../utils/types';
import {useComputedReservationDetails} from '../../context/computedReservationDetails';
import {useIpDetails} from '../../context/ipDetails';
import {COUNTRY_CODES} from '../../utils/constants';
import Tooltip from '../Tooltip';
import {FieldQuestionMarkButton, TooltipTrigger} from '../AddPersonalDataForm/styled';
import {
  DateInput,
  DateSelect,
  DateSelectWrapper,
  ErrorMessage,
  FieldsWrapper,
  Label,
  LabelWrapper,
  Wrapper,
} from './styled';

const DAY_PATTERN = /^(([0]?[1-9])|([1-2][0-9])|(3[01]))$/;
const YEAR_PATTERN = /^(19|20)\d{2}$/;
const MONTHS = () => ({
  january: {
    label: i18n.t('january'),
    value: '1',
  },
  february: {
    label: i18n.t('february'),
    value: '2',
  },
  march: {
    label: i18n.t('march'),
    value: '3',
  },
  april: {
    label: i18n.t('april'),
    value: '4',
  },
  may: {
    label: i18n.t('may'),
    value: '5',
  },
  june: {
    label: i18n.t('june'),
    value: '6',
  },
  july: {
    label: i18n.t('july'),
    value: '7',
  },
  august: {
    label: i18n.t('august'),
    value: '8',
  },
  september: {
    label: i18n.t('september'),
    value: '9',
  },
  october: {
    label: i18n.t('october'),
    value: '10',
  },
  november: {
    label: i18n.t('november'),
    value: '11',
  },
  december: {
    label: i18n.t('december'),
    value: '12',
  },
});

function getNextMonth(monthIndex = 0) {
  const monthNumber = monthIndex + 1;
  return Object.values(MONTHS()).find(m => m.value === String(monthNumber));
}

type DatepickerProps = {
  label?: string;
  defaultValues?: {
    day: string | number | null;
    month: SelectOptionType | null;
    year: string | number | null;
  };
  onChange?: (value: DatepickerDateType, name?: string) => void;
  invalid?: boolean;
  value?: DatepickerDateType;
  error?: any;
  disabled?: boolean;
  showDefaultMonth?: boolean;
  name?: string;
  withTooltip?: boolean;
  tooltipContentKey?: string | React.ReactNode;
  className?: string;
};

const defaultProps: DatepickerProps = {
  label: '',
  error: '',
  defaultValues: {
    day: '',
    month: null,
    year: '',
  },
  onChange: () => {},
  invalid: false,
  value: null,
  disabled: false,
  showDefaultMonth: false,
  name: '',
  withTooltip: false,
  tooltipContentKey: '',
};

function Datepicker({
  label,
  defaultValues,
  onChange,
  invalid,
  value,
  error,
  disabled,
  name,
  withTooltip,
  tooltipContentKey,
  showDefaultMonth,
  className,
}: DatepickerProps) {
  const getDefaultMonth = () => {
    if (defaultValues?.month) {
      return defaultValues.month;
    }
    if (showDefaultMonth) {
      return Object.values(MONTHS).find(option => {
        return option?.value === (today.getMonth() + 1).toString();
      });
    }
    return undefined;
  };
  const getDefaultYear = () => {
    if (defaultValues?.year) {
      return defaultValues.year;
    }
    if (showDefaultMonth) {
      return today.getFullYear();
    }
    return undefined;
  };

  const {t} = useTranslation();
  const today = new Date();
  const [day, setDay] = React.useState(defaultValues?.day);
  const [month, setMonth] = React.useState<SelectOptionType | undefined | null>(
    getDefaultMonth(),
  );
  const [year, setYear] = React.useState(getDefaultYear());
  const [isInvalidDate, setIsInvalidDate] = React.useState(false);
  const [isYearInvalid, setIsYearInvalid] = React.useState(false);
  const stringValue = value?.toString();
  const {isUsaReservation} = useComputedReservationDetails();
  const {ipDetails} = useIpDetails();
  const isMMddYYYYFormat =
    isUsaReservation || ipDetails?.country_code === COUNTRY_CODES.usa;

  React.useEffect(() => {
    function setValue(date: Date) {
      const isValidValueDate = isValid(date);
      if (isValidValueDate) {
        const day = getDate(date);
        setDay(String(day));

        const month = getMonth(date);
        setMonth(getNextMonth(month));

        const year = getYear(date);
        setYear(String(year));
      }
    }

    if (stringValue) {
      const date = new Date(stringValue);
      setValue(date);
    }
  }, [stringValue]);

  React.useEffect(
    function updateMonthTranslationOnLanguageChange() {
      setMonth(prevMonth => {
        if (!prevMonth) {
          return prevMonth;
        }

        const updatedTranslationMonth = Object.values(MONTHS()).find(month => {
          return month.value === prevMonth.value;
        });
        return updatedTranslationMonth;
      });
    },
    [t],
  );

  const handleChange = React.useCallback(
    (params: any) => {
      const day = params?.day;
      const monthValue = params?.month?.value;
      const year = params?.year;

      if (!day || !monthValue || !year) {
        onChange!(undefined, name);
        return;
      }

      if (!YEAR_PATTERN.test(String(year))) {
        setIsYearInvalid(true);
        onChange!(undefined, name);
        return;
      } else {
        setIsYearInvalid(false);
      }

      const date = new Date(`${monthValue}/${day}/${year}`);
      if (isValid(date)) {
        setIsInvalidDate(false);
        onChange!(date, name);
      } else {
        setIsInvalidDate(true);
        onChange!(undefined, name);
      }
    },
    [name, onChange],
  );

  const handleDayChange = React.useCallback(
    ({target}: InputEventType) => {
      const value = target.value;
      if (value !== '' && !DAY_PATTERN.test(value)) {
        return;
      }

      setDay(value);
      handleChange({
        day: value,
        month,
        year,
      });
    },
    [handleChange, month, year],
  );

  const handleYearChange = React.useCallback(
    ({target}: InputEventType) => {
      const value = target.value;
      if (value.length > 4) {
        return;
      }

      setYear(value);
      handleChange({
        year: value,
        day,
        month,
      });
    },
    [day, handleChange, month],
  );

  const handleMonthChange = React.useCallback(
    (option: SelectOptionType) => {
      setMonth(option);
      handleChange({
        month: option,
        day,
        year,
      });
    },
    [day, handleChange, year],
  );

  return (
    <Wrapper aria-label={name} disabled={disabled} className={className}>
      <LabelWrapper>
        <Label>{label}</Label>
        {withTooltip && (
          <Tooltip position="top center" label={tooltipContentKey}>
            <TooltipTrigger>
              <FieldQuestionMarkButton />
            </TooltipTrigger>
          </Tooltip>
        )}
      </LabelWrapper>
      <FieldsWrapper>
        {isMMddYYYYFormat ? (
          <>
            <DateSelectWrapper>
              <DateSelect
                disabled={disabled}
                options={Object.values(MONTHS())}
                value={month}
                onChange={handleMonthChange}
                invalid={invalid || Boolean(error) || isInvalidDate}
                name={`${name}-month`}
                placeholder={t('month')}
              />
            </DateSelectWrapper>
            <DateInput
              hideNumberButtons
              disabled={disabled}
              onChange={handleDayChange}
              placeholder={t('day')}
              value={String(day || '')}
              type="number"
              name={`${name}-day`}
              invalid={invalid || Boolean(error) || isInvalidDate}
            />
          </>
        ) : (
          <>
            <DateInput
              hideNumberButtons
              disabled={disabled}
              onChange={handleDayChange}
              placeholder={t('day')}
              value={String(day || '')}
              type="number"
              name={`${name}-day`}
              invalid={invalid || Boolean(error) || isInvalidDate}
            />
            <DateSelectWrapper>
              <DateSelect
                disabled={disabled}
                options={Object.values(MONTHS())}
                value={month}
                onChange={handleMonthChange}
                invalid={invalid || Boolean(error) || isInvalidDate}
                name={`${name}-month`}
                placeholder={t('month')}
              />
            </DateSelectWrapper>
          </>
        )}
        <DateInput
          hideNumberButtons
          disabled={disabled}
          onChange={handleYearChange}
          placeholder={t('year')}
          value={String(year || '')}
          type="number"
          name={`${name}-year`}
          invalid={invalid || Boolean(error) || isInvalidDate || isYearInvalid}
        />
      </FieldsWrapper>
      {error && <ErrorMessage data-testid={`${name}-error`}>{error}</ErrorMessage>}
    </Wrapper>
  );
}

Datepicker.defaultProps = defaultProps;
export {Datepicker};

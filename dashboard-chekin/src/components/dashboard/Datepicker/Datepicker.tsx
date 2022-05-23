import React from 'react';
import {useTranslation} from 'react-i18next';
import {getDate, getMonth, getYear, isValid} from 'date-fns';
import {
  DatepickerDate,
  InputEventType,
  SelectOption,
  ReactEntity,
} from '../../../utils/types';
import Tooltip from '../Tooltip';
import QuestionMarkButton from '../QuestionMarkButton';
import {Name as InputName} from '../Input/styled';
import {
  DateInput,
  DateSelect,
  FieldsWrapper,
  Wrapper,
  ErrorMessage,
  LabelWrapper,
} from './styled';
import {MONTHS} from '../../../utils/constants';

const DAY_PATTERN = /^(([0]?[1-9])|([1-2][0-9])|(3[01]))$/;
const YEAR_PATTERN = /^(19|20)\d{2}$/;

function getNextMonth(monthIndex = 0) {
  const monthNumber = monthIndex + 1;
  return Object.values(MONTHS).find((m) => m.value === String(monthNumber));
}

type DatepickerProps = {
  label?: string;
  defaultValues?: {
    day: string | number | null;
    month: SelectOption | null;
    year: string | number | null;
  };
  onChange?: (value: DatepickerDate, name?: string) => void;
  invalid?: boolean;
  value?: DatepickerDate; // NOTE: Use null to reset all fields
  error?: any;
  disabled?: boolean;
  showDefaultMonth?: boolean;
  name?: string;
  tooltipContent?: ReactEntity;
  className?: string;
  tabIndex?: number;
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
  value: undefined,
  disabled: false,
  showDefaultMonth: false,
  name: '',
  tooltipContent: '',
  className: undefined,
};

function Datepicker({
  label,
  defaultValues,
  onChange,
  invalid,
  value,
  error,
  disabled,
  showDefaultMonth,
  name,
  tooltipContent,
  className,
  tabIndex,
}: DatepickerProps) {
  const getDefaultMonth = () => {
    if (defaultValues?.month) {
      return defaultValues.month;
    }
    if (showDefaultMonth) {
      return Object.values(MONTHS).find((option) => {
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
  const [month, setMonth] = React.useState<SelectOption | undefined | null>(
    getDefaultMonth(),
  );
  const [year, setYear] = React.useState(getDefaultYear());
  const [isInvalidDate, setIsInvalidDate] = React.useState(false);
  const [isYearInvalid, setIsYearInvalid] = React.useState(false);
  const stringValue = value?.toString();
  const isEmpty = Boolean(!day && !month && !year);

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

  React.useEffect(() => {
    if (value === null) {
      setDay(undefined);
      setMonth(null);
      setYear(undefined);
    }
  }, [value]);

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
    (option: SelectOption) => {
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
    <Wrapper disabled={disabled} className={className}>
      <LabelWrapper>
        <InputName>{label}</InputName>
        {tooltipContent && (
          <Tooltip
            isMouseOver
            content={tooltipContent}
            trigger={<QuestionMarkButton />}
          />
        )}
      </LabelWrapper>
      <FieldsWrapper>
        <DateInput
          tabIndex={tabIndex}
          disabled={disabled}
          onChange={handleDayChange}
          placeholder={t('day')}
          value={day ? String(day) : ''}
          type="number"
          name={`${name}-day`}
          empty={isEmpty}
          invalid={invalid || Boolean(error) || isInvalidDate}
        />
        <DateSelect
          tabIndex={tabIndex}
          disabled={disabled}
          options={Object.values(MONTHS)}
          value={month}
          onChange={handleMonthChange}
          invalid={invalid || Boolean(error) || isInvalidDate}
          name={`${name}-month`}
          empty={isEmpty}
          placeholder={t('month')}
        />
        <DateInput
          tabIndex={tabIndex}
          disabled={disabled}
          onChange={handleYearChange}
          placeholder={t('year')}
          value={year ? String(year) : ''}
          type="number"
          name={`${name}-year`}
          empty={isEmpty}
          invalid={invalid || Boolean(error) || isInvalidDate || isYearInvalid}
        />
      </FieldsWrapper>
      {error && <ErrorMessage data-testid={`${name}-error`}>{error}</ErrorMessage>}
    </Wrapper>
  );
}

Datepicker.defaultProps = defaultProps;
export {Datepicker};

import React from 'react';
import {isMobile} from 'react-device-detect';
import {DateRangePickerShape, DateRangePicker as ReactDatesPicker} from 'react-dates';
import moment from 'moment';
import i18n from 'i18next';
import arrowIcon from '../../../assets/arrow_login_icn.svg';
import removeIcon from '../../../assets/remove.svg';
import calendarIcon from 'assets/calendar-icon.svg';
import {ErrorMessage} from '../../../styled/common';
import {
  NavPrevButton,
  Wrapper,
  NavNextButton,
  Arrow,
  Label,
  ClearIcon,
  CalendarIcon,
} from './styled';

const PLACEHOLDER = '00-00-0000';
const DISPLAY_FORMAT = 'DD-MM-YYYY';

type DateRangePickerProps = DateRangePickerShape & {
  label?: string;
  error?: any;
  className?: string;
  hideCalendarIcon?: boolean;
  empty?: boolean;
};

function DateRangePicker({
  label,
  error,
  className,
  disabled,
  empty,
  hideCalendarIcon,
  ...props
}: DateRangePickerProps) {
  const isEmpty = empty === undefined ? !props?.startDate && !props?.endDate : empty;

  return (
    <div className={className}>
      <Label>{label}</Label>
      <Wrapper
        disabled={Boolean(disabled)}
        error={error}
        empty={isEmpty}
        focused={Boolean(props?.focusedInput)}
      >
        {!hideCalendarIcon && <CalendarIcon src={calendarIcon} alt="" />}
        <ReactDatesPicker
          renderMonthElement={({month}) => {
            const monthName = moment(month).format('MMMM');
            return i18n.t(monthName?.toLowerCase());
          }}
          noBorder
          showClearDates
          hideKeyboardShortcutsPanel
          readOnly={isMobile}
          withFullScreenPortal={isMobile}
          disabled={disabled}
          displayFormat={DISPLAY_FORMAT}
          customCloseIcon={<ClearIcon src={removeIcon} alt="Clear dates" />}
          customArrowIcon={<Arrow empty={isEmpty}>→</Arrow>}
          isOutsideRange={() => {
            return false;
          }}
          navNext={
            <NavNextButton>
              <img src={arrowIcon} alt="Next months" />
            </NavNextButton>
          }
          startDatePlaceholderText={PLACEHOLDER}
          endDatePlaceholderText={PLACEHOLDER}
          navPrev={
            <NavPrevButton>
              <img src={arrowIcon} alt="Prev months" />
            </NavPrevButton>
          }
          {...props}
        />
      </Wrapper>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </div>
  );
}

export {DateRangePicker};

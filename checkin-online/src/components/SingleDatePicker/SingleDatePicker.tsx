import React from 'react';
import arrowIcon from '../../assets/arrow_login_icn.svg';
import calendarIcon from '../../assets/calendar-icon.svg';
import {
  SingleDatePickerShape,
  SingleDatePicker as ReactSingleDatePicker,
} from 'react-dates';
import {RelativeWrapper, ErrorMessage} from '../../styled/common';
import {Label, NavPrevButton, NavNextButton} from '../DateRangePicker/styled';
import {Wrapper, CalendarIcon} from './styled';

const placeholder = '00-00-0000';
const displayFormat = 'DD-MM-YYYY';
const numberOfMonth = 1;

export type SingleDatePickerProps = SingleDatePickerShape & {
  label?: string;
  error?: any;
  className?: string;
};

function SingleDatePicker({label, error, className, ...props}: SingleDatePickerProps) {
  return (
    <Wrapper error={error} focused={Boolean(props.focused)} className={className}>
      <Label>{label}</Label>
      <RelativeWrapper>
        <ReactSingleDatePicker
          noBorder
          hideKeyboardShortcutsPanel
          numberOfMonths={numberOfMonth}
          displayFormat={displayFormat}
          navNext={
            <NavNextButton>
              <img src={arrowIcon} alt="Next" />
            </NavNextButton>
          }
          placeholder={placeholder}
          navPrev={
            <NavPrevButton>
              <img src={arrowIcon} alt="Prev" />
            </NavPrevButton>
          }
          {...props}
        />
        <CalendarIcon src={calendarIcon} alt="" />
      </RelativeWrapper>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </Wrapper>
  );
}

export {SingleDatePicker};

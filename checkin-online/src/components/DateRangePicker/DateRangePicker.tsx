import React from 'react';
import {DateRangePickerShape, DateRangePicker as ReactDatesPicker} from 'react-dates';
import arrowIcon from '../../assets/arrow_login_icn.svg';
import removeIcon from '../../assets/remove.svg';
import {ErrorMessage} from '../../styled/common';
import {NavPrevButton, Wrapper, NavNextButton, Arrow, Label, ClearIcon} from './styled';

const PLACEHOLDER = '00-00-0000';
const DISPLAY_FORMAT = 'DD-MM-YYYY';

type DateRangePickerProps = DateRangePickerShape & {
  label?: string;
  error?: any;
  className?: string;
};

function DateRangePicker({
  label,
  error,
  className,
  disabled,
  ...props
}: DateRangePickerProps) {
  const isEmpty = !props?.startDate && !props?.endDate;

  return (
    <div className={className}>
      <Wrapper
        className="wrapper"
        disabled={Boolean(disabled)}
        error={error}
        empty={isEmpty}
        focused={Boolean(props?.focusedInput)}
      >
        <Label>{label}</Label>
        <ReactDatesPicker
          noBorder
          showClearDates
          hideKeyboardShortcutsPanel
          disabled={disabled}
          displayFormat={DISPLAY_FORMAT}
          customCloseIcon={<ClearIcon src={removeIcon} alt="Remove" />}
          customArrowIcon={<Arrow empty={isEmpty}>→</Arrow>}
          isOutsideRange={() => {
            return false;
          }}
          navNext={
            <NavNextButton>
              <img src={arrowIcon} alt="Arrow" />
            </NavNextButton>
          }
          startDatePlaceholderText={PLACEHOLDER}
          endDatePlaceholderText={PLACEHOLDER}
          navPrev={
            <NavPrevButton>
              <img src={arrowIcon} alt="Arrow" />
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

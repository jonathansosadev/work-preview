import styled, {css} from 'styled-components';

export const NavPrevButton = styled.button`
  border: 1px solid #cccddd;
  border-radius: 2px;
  background-color: white;
  outline: none;
  user-select: none;
  width: 30px;
  height: 30px;
  cursor: pointer;
  position: absolute;
  top: 0;
  left: 0;
  display: inline-flex;
  justify-content: center;
  align-items: center;

  & > img {
    width: 15px;
    position: relative;
    top: 1px;
  }

  &:hover {
    border-color: rgba(26, 140, 255, 0.4);
  }

  &:active {
    border-color: #385cf8;
  }
`;

export const NavNextButton = styled(NavPrevButton)`
  left: unset;
  right: 0;

  & > img {
    transform: rotate(180deg);
  }
`;

export const ClearIcon = styled.img`
  height: 15px;
  width: 15px;
  border-radius: 3px;
  cursor: pointer;

  &:active {
    opacity: 0.95;
  }

  &:hover {
    box-shadow: 0 3px 3px #0f477734;
    transition: box-shadow 0.15s ease-in-out;
  }
`;

type WrapperProps = {
  focused: boolean;
  empty: boolean;
  error: any;
  disabled: boolean;
};

export const Wrapper = styled.div<WrapperProps>`
  width: 293px;
  height: 44px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  position: relative;
  border-width: 1px;
  border-style: solid;
  border-radius: 7px;
  border-color: ${(props) => {
    if (props.error) {
      return '#ff2467';
    }

    if (props.focused) {
      return '#385cf8';
    }

    return '#161643';
  }};

  ${(props) =>
    props.disabled &&
    css`
      opacity: 0.3;
      cursor: not-allowed;

      & ${ClearIcon} {
        cursor: not-allowed;

        &:hover,
        &:active {
          opacity: 1;
          box-shadow: none;
        }
      }
    `};

  ${(props) =>
    props.empty &&
    css`
      background: #f4f6f8;
      color: #8181a3;
      border: none;
    `};

  .DateRangePicker {
    & .DateInput:first-child .DateInput_input {
      padding: 9px 0 9px 14px;
    }

    & .DateInput_input {
      padding: 9px 48px 9px 0;
    }
  }

  .DateInput {
    width: 90px;
  }

  .DateInput_input {
    font-family: ProximaNova-Medium, sans-serif;
    color: #161643;
    font-size: 16px;
    width: 100%;
    border: none;

    &::placeholder {
      color: ${(props) => (props.empty ? '#8181A3' : '#161643')};
    }
  }

  .DateInput_input__focused {
    border-bottom-color: transparent;
  }

  .DayPicker__withBorder {
    padding: 27px 50px 0;
  }

  .CalendarMonth_caption {
    padding-top: 4px;
    padding-bottom: 35px;
  }

  .DayPicker_weekHeader {
    top: 69px;
  }

  .DayPicker_weekHeader_ul {
    font-family: ProximaNova-Light, sans-serif;
    font-size: 14px;
    color: #385cf8;
    cursor: default;
  }

  .CalendarMonth_table {
    margin-top: 45px;
  }

  .DayPicker_transitionContainer {
    min-height: 360px;
  }

  .DateInput_fang {
    z-index: 4 !important;
    position: absolute !important;
  }

  .DateRangePicker_picker {
    z-index: 3 !important;
    position: absolute !important;
    padding-bottom: 7px !important;
  }

  .CalendarMonth_caption strong {
    font-family: ProximaNova-Light, sans-serif;
    color: #161643;
    font-size: 18px;
    font-weight: normal;
  }

  &&& .CalendarDay__blocked_out_of_range {
    &,
    &:active,
    &:hover {
      background-color: transparent;
      color: #b4b4d3;
      border: none;
      font-family: ProximaNova-Light, sans-serif;
      font-size: 16px;
    }
  }

  .CalendarDay__default {
    border: none;
    font-family: ProximaNova-Light, sans-serif;
    font-size: 16px;
    color: #161643;
    border-radius: 50%;

    &:hover {
      background-color: #2699fb12;
    }

    &&&::after {
      display: none;
    }
  }

  .CalendarDay__selected {
    position: relative;
    z-index: 5;

    &,
    &:active,
    &:hover {
      background: none;
      color: white;
    }

    &::after {
      position: absolute;
      content: '';
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      margin: auto;
      height: 26px;
      width: 26px;
      background: #385cf8;
      z-index: -1;
      border-radius: 100%;
    }
  }

  .CalendarDay__selected_start + .CalendarDay__selected_end {
    &::before {
      position: absolute;
      content: '';
      top: 0;
      left: -20px;
      bottom: 0;
      margin: auto;
      height: 22px;
      width: 50px;
      background: #edf7ff;
      z-index: -1;
    }
  }

  .CalendarDay__selected_start
    + .CalendarDay__hovered_span.CalendarDay__after_hovered_start {
    &::after {
      display: none;
    }
  }

  .CalendarDay__selected_start + .CalendarDay__selected_span,
  .CalendarDay__selected_start
    + .CalendarDay__hovered_span:not(.CalendarDay__after_hovered_start) {
    position: relative;
    z-index: 0;

    &::before {
      position: absolute;
      content: '';
      top: 0;
      left: -20px;
      bottom: 0;
      margin: auto;
      height: 22px;
      width: 25px;
      background: #edf7ff;
      z-index: -1;
    }
  }

  .CalendarDay__selected_end {
    position: relative;
    z-index: 1;

    &::before {
      position: absolute;
      content: '';
      top: 0;
      left: 0;
      bottom: 0;
      margin: auto;
      height: 22px;
      width: 13px;
      background: #edf7ff;
      z-index: -1;
    }
  }

  td:empty + td {
    &.CalendarDay__selected_span,
    &.CalendarDay__hovered_span {
      &:not(.CalendarDay__firstDayOfWeek):not(.CalendarDay__selected_start)::after {
        position: absolute;
        content: '';
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        margin: auto;
        width: 100%;
        height: 22px;
        background: #edf7ff;
        z-index: -1;
      }

      &.CalendarDay__lastDayOfWeek:hover::after {
        display: none;
      }
    }
  }

  .CalendarDay__selected_span,
  .CalendarDay__hovered_span {
    position: relative;
    z-index: 1;

    &,
    &:active {
      background: none;
    }

    &:hover {
      background-color: #2699fb12;

      &:not(.CalendarDay__firstDayOfWeek)::after {
        position: absolute;
        content: '';
        top: 0;
        left: -20px;
        right: 0;
        bottom: 0;
        margin: auto;
        width: 100%;
        height: 22px;
        background: #edf7ff;
        z-index: -1;
      }
    }

    &:hover + .CalendarDay__selected_span,
    &:hover + .CalendarDay__hovered_span,
    &:hover + .CalendarDay__selected {
      &::before {
        position: absolute;
        content: '';
        top: 0;
        left: -10px;
        right: 0;
        bottom: 0;
        margin: auto;
        width: 35px;
        height: 22px;
        background: #edf7ff;
        z-index: -1;
      }
    }

    &:not(:hover)::after {
      position: absolute;
      content: '';
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      margin: auto;
      width: 100%;
      height: 22px;
      background: #edf7ff;
      z-index: -1;
    }
  }

  .DayPicker__withBorder {
    box-shadow: 0 5px 5px #2148ff1a, 0 0 0 1px #385cf8;
  }

  .DateInput_fangStroke {
    stroke: #385cf8;
  }

  .DateInput_fang {
    margin-top: 1px;
  }

  .DateRangePickerInput_clearDates {
    padding: 5px;
    outline: none;
    height: 24px;
    right: -25px;
    margin: 0;
  }

  .DateRangePickerInput,
  .DateInput,
  .DateInput_input {
    background-color: transparent;
  }

  .DateInput_input__disabled {
    font-style: normal;
    background-color: transparent;
  }

  .DateRangePickerInput__showClearDates {
    padding-right: 0;
  }
`;

type ArrowProps = {
  empty: boolean;
};

export const Arrow = styled.div<ArrowProps>`
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 16px;
  background-color: transparent;
  pointer-events: none;
  padding-left: 25px;
  padding-right: 15px;
  color: ${(props) => (props.empty ? '#8181A3' : '#161643')};
`;

export const Label = styled.div`
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 16px;
  color: #161643;
  pointer-events: none;
  margin-bottom: 6px;
`;

export const CalendarIcon = styled.img`
  position: absolute;
  top: 11px;
  right: 14px;
  box-shadow: 0 3px 4px #0002032b;
  border-radius: 4px;
`;

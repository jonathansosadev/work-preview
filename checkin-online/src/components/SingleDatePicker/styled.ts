import styled from 'styled-components';
import {SingleDatePickerProps} from './SingleDatePicker';
import {device} from '../../styled/device';

export const Wrapper = styled.div<Pick<SingleDatePickerProps, 'focused' | 'error'>>`
  width: 293px;
  position: relative;

  .DateInput {
    width: 100%;
    display: flex;
    border-radius: 7px;
    padding: 12px 10px;
    box-sizing: border-box;
    border: 1px solid
      ${props => {
        if (props.error) {
          return '#ff2467';
        }

        if (props.focused) {
          return '#385cf8';
        }

        return '#a2a2b4';
      }};
  }

  .SingleDatePicker,
  .SingleDatePickerInput {
    display: block;
  }

  .DateInput_input {
    border: none;
    font-family: ProximaNova-Medium, sans-serif;
    color: #161643;
    font-size: 18px;
    padding: 0;
    width: 100%;

    &::placeholder {
      color: #161643;
    }

    @media (max-width: ${device.mobileL}) {
      font-size: 20px;
    }
  }

  .DateInput_input__focused {
    border-bottom-color: transparent;
  }

  .DayPicker__withBorder {
    padding: 27px 50px 0;

    @media (max-width: ${device.mobileL}) {
      padding: 20px 20px 0;
    }
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
    box-shadow: 0 5px 5px #2699fb1a, 0 0 0 1px #385cf8;
  }

  .DateInput_fangStroke {
    stroke: #385cf8;
  }

  .DateInput_fang {
    margin-top: 1px;
  }

  .DateRangePickerInput_clearDates {
    right: -23px;
    padding: 0;
    outline: none;
  }

  .DateRangePickerInput,
  .DateInput,
  .DateInput_input {
    background-color: transparent;
  }

  .DateRangePicker {
    top: 2px;
  }

  .DateRangePickerInput_arrow {
    background: white;
    padding-bottom: 3px;
    position: relative;
  }

  .DateInput_input__disabled {
    font-style: normal;
    background-color: transparent;
  }

  .DateRangePickerInput__showClearDates {
    padding-right: 0;
  }
`;

export const CalendarIcon = styled.img`
  position: absolute;
  top: 15px;
  right: 12px;
  box-shadow: 0 3px 4px #0002032b;
  border-radius: 4px;
  pointer-events: none;
`;

import {createGlobalStyle} from 'styled-components';

export const BASE_BLUE_COLOR = '#002CFA';

export const BASE_FONT_COLOR = '#161643';
export const BASE_LINK_COLOR = BASE_BLUE_COLOR;

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #FDFDFF;
    color: ${BASE_FONT_COLOR};
  };

  a {
    color: ${BASE_LINK_COLOR};
    text-decoration: none;
  };

  button {
    color: ${BASE_FONT_COLOR};
    background-color: transparent;
    border: none;
    outline: none;
    cursor: pointer;
  };

  input {
    color: inherit;
  }

  .Toastify {
    font-family: ProximaNova-Semibold, sans-serif;
    box-shadow: 0 10px 10px #01376522;
    font-size: 16px;
  };

  .Toastify__toast-body {
    padding: 0 32px 0 17px;
    max-width: 400px;
    color: #fff !important;
  };

  .Toastify__toast--info {
    background: #385cf8 !important;
  };

  .Toastify__toast--warning {
    background: #FFC400 !important;
  };

  .Toastify__toast--error {
    background: #FF2467 !important;
  };

  .Toastify__toast--success {
    background: #35E5BC !important;
  };

  .Toastify__toast {
    border-radius: 3px !important;
    min-height: auto !important;
    padding: 8px 0 9px !important;
  };

  .Toastify__toast-container {
    height: 54px !important;
    width: auto !important;
  };

  .Toastify__toast-container--bottom-right {
    right: 24px !important;
    bottom: 200px !important;
  };

  .Toastify__close-button {
    top: 3px;
    right: 7px;
    position: absolute;
    transition: 0.1s ease-out;
    color: #ffffff;
    opacity: .7;
  }

  .DateRangePicker_picker__portal {
    z-index: 999;

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
      color: #1a8cff;
      cursor: default;
    }

    .CalendarMonth_table {
      margin-top: 45px;
    }

    .DayPicker_transitionContainer {
      min-height: 360px;
    }

    .CalendarMonth_caption strong {
      font-family: ProximaNova-Light, sans-serif;
      color: #161643;
      font-size: 18px;
      font-weight: normal;
    }

    .CalendarDay__default {
      border: none;
      font-family: ProximaNova-Light, sans-serif;
      font-size: 16px;
      color: #161643;
    }

    .CalendarDay__selected_span {
      background: #edf7ff;
    }

    .CalendarDay__selected {
      &, &:hover {
        color: white;
        background: rgb(26, 140, 255);
      }
    }

    .CalendarDay__selected_start, .CalendarDay__selected_end {
      background: rgb(26, 140, 255);
    }

    .DateInput_input__disabled {
      font-style: normal;
      background-color: transparent;
    }

    .DateRangePicker_closeButton {
      right: 7%;
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
  }
`;

export {GlobalStyle};

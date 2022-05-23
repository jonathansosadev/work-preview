import styled from 'styled-components';

export const Wrapper = styled.div`
  position: relative;
  max-width: 471px;
  height: 87px;
  margin: auto;

  & .onboarding-select {
    top: 0 !important;
    bottom: 0 !important;
    margin: auto !important;
    justify-content: center !important;
    display: flex !important;
    align-items: center !important;
  }

  & .onboarding-select__control {
    cursor: pointer !important;
    min-width: auto !important;
    width: 100% !important;
    max-width: 471px !important;
    height: 87px !important;
    border-radius: 3px !important;
    box-shadow: 0 15px 15px 0 rgba(38, 153, 251, 0.1) !important;
    border: solid 1px #2960f5 !important;
    background-color: #ffffff !important;
    transition: box-shadow 0.08s ease-in-out !important;

    &:hover {
      box-shadow: none !important;
    }
  }

  & .onboarding-select.has-value .onboarding-select__control,
  & .onboarding-select__control--is-focused {
    box-shadow: none !important;
    border: solid 2px #161643 !important;
  }

  & .onboarding-select__value-container {
    padding-left: 14px !important;
    margin-top: 26px !important;
    height: 35px !important;
  }

  & .onboarding-select__dropdown-indicator {
    display: none !important;
  }

  & .onboarding-select__indicator-separator {
    display: none !important;
  }

  & .onboarding-select__option {
    padding: 20px 0 15px 40px !important;
  }

  & .onboarding-select__option.onboarding-select__option--is-selected {
    background-color: white !important;
    font-family: ProximaNova-Medium, sans-serif !important;
    font-weight: 500 !important;
    color: #2960f5 !important;
  }

  &
    .onboarding-select__option.onboarding-select__option--is-focused.onboarding-select__option--is-selected {
    cursor: default !important;
  }

  & .onboarding-select__option.onboarding-select__option--is-focused {
    cursor: pointer !important;
    font-weight: 500 !important;
    font-family: ProximaNova-Medium, sans-serif !important;
  }

  & .onboarding-select__menu {
    margin-left: 40px;
    margin-top: -50px !important;
    font-family: ProximaNova-Semibold, sans-serif !important;
    font-size: 19px !important;
    max-width: 350px !important;
    min-height: 165px !important;
    background-color: #ffffff;
    box-shadow: none !important;
    z-index: 2 !important;
  }

  & .onboarding-select__menu-notice {
    color: #161643 !important;
    text-align: left !important;
    padding: 13px 10px 13px 0 !important;
    font-size: 17px !important;
  }

  & .onboarding-select__menu-list {
    box-shadow: 0 15px 15px 0 rgba(38, 153, 251, 0.1) !important;
    max-width: 350px !important;
    min-height: 165px !important;
    max-height: 327px !important;
    padding: 0 158px 0 37px !important;
  }

  & .onboarding-select__option {
    font-family: ProximaNova-Light, sans-serif !important;
    font-size: 19px !important;
    text-align: left !important;
    color: #161643 !important;
    padding: 20px 18px 20px 8px !important;
    box-sizing: border-box !important;
    background-color: white !important;
    border-bottom: 1px solid rgba(38, 153, 251, 0.1) !important;
  }

  & .onboarding-select__option:last-child {
    border-bottom-color: transparent !important;
  }

  & .onboarding-select__placeholder {
    font-family: ProximaNova-Regular, sans-serif !important;
    font-size: 26px !important;
    line-height: 1.21 !important;
    letter-spacing: normal !important;
    text-align: center !important;
    color: #161643 !important;
  }

  & .onboarding-select__single-value {
    font-family: ProximaNova-Medium, sans-serif !important;
    font-size: 26px !important;
    color: #161643 !important;
  }

  @media (max-width: 425px) {
    & .onboarding-select__menu {
      margin-left: 0 !important;
    }
  }
`;

type HintProps = {
  active?: boolean;
};

export const Hint = styled.div<HintProps>`
  position: absolute;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 19px;
  top: 10px;
  left: 19px;
  z-index: 2;
  user-select: none;
  pointer-events: none;
  color: ${(props) => (props.active ? '#161643' : '#2960F5')};
`;

export const Label = styled.div`
  position: absolute;
  top: 14px;
  user-select: none;
  right: 45px;
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 13px;
  z-index: 2;
  text-align: right;
  pointer-events: none;
  color: #2960f5;
`;

export const DisplayIcon = styled.img`
  height: 8px;
  user-select: none;
  z-index: 2;
  width: 12px;
  position: absolute;
  top: 18px;
  right: 31px;
  pointer-events: none;
`;

export const CollapseIcon = styled(DisplayIcon)`
  top: 17px;
  transform: rotateX(180deg);
  pointer-events: none;
`;

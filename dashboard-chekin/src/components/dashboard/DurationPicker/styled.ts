import React from 'react';
import styled from 'styled-components';
import {Styles} from 'react-select';
import {CustomCheckbox} from '../Checkbox';
import Button from '../Button';
import Select, {styles as selectStyles} from '../Select';
import {baseContentStyle} from '../Modal';
import {BaseButton} from '../../../styled/common';

export const contentStyle: React.CSSProperties = {
  ...baseContentStyle,
  minWidth: 'auto',
};

export const Text = styled.div``;

export const DisplayIcon = styled.img`
  margin-left: auto;
  width: 11px;
  height: 7px;
  transform: rotate(-90deg);
  user-select: none;
  transition: transform 0.1s ease-in-out;
`;

export const ContainerWrapper = styled.div`
  width: 330px;
  height: 60px;
`;

export const Container = styled(BaseButton)<{invalid: boolean}>`
  border: 1px solid ${(props) => (props.invalid ? '#ff2467' : '#e0e0e5')};
  border-radius: 6px;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 14px;
  color: #2148ff;
  font-size: 15px;
  font-family: ProximaNova-Medium, sans-serif;
  cursor: pointer;
  position: relative;
  opacity: ${(props) => props.disabled && 0.7};

  &:hover {
    opacity: 1;

    & ${Text} {
      opacity: 0.7;
    }

    & ${DisplayIcon} {
      transform: rotate(-90deg) translateY(3px);
    }
  }

  &:active {
    & ${Text} {
      opacity: 1;
    }
  }
`;

export const AvailabilityContainer = styled.div`
  padding: 40px 45px 0;
`;

export const GridRow = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-template-columns: 150px auto auto;
  grid-column-gap: 20px;
  align-items: center;
`;

export const StyledCheckbox = styled(CustomCheckbox)`
  min-width: auto;
`;

export const Hr = styled.hr`
  border: none;
  border-bottom: 1px solid #161643;
  opacity: 0.12;
  margin: 10px 25px;
`;

export const TimeContainer = styled.div`
  display: grid;
  grid-auto-flow: column;
  justify-content: flex-start;
  grid-column-gap: 10px;
  align-items: center;
`;

export const TimeText = styled.div`
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 16px;
  color: #acacd5;
`;

const smallSelectStyles: Styles<any, false> = {
  input: (base) => ({
    ...base,
    ...selectStyles.input,
    marginRight: 'auto',
    marginLeft: 5,
  }),
};

export const SmallSelect = styled(Select).attrs({styles: smallSelectStyles})`
  &,
  .select__menu,
  .select__menu-list {
    width: 85px;
    ::-webkit-scrollbar {
      width: 0;
    }
  }

  .select__indicators {
    display: none;
  }

  .select__value-container {
    padding: 0 4px;
    justify-content: center;
  }

  .select__menu-list {
    padding: 0;
    max-height: 155px;
  }

  .select__option {
    padding: 8px 12px;
    text-align: center;
  }

  .select__menu-notice {
    font-size: 14px;
  }
`;

export const DayCheckboxWrapper = styled.div`
  border-right: 1px solid rgba(22, 22, 67, 0.12);
  height: 100%;
  display: flex;
  padding-right: 50px;

  & ${StyledCheckbox} {
    margin: auto 0;
  }
`;

export const SubmitButton = styled(Button)`
  min-width: 146px;
  height: 48px;
  font-size: 16px;
  justify-content: center;
  margin: 29px auto;
`;

export const Preview = styled.div`
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 15px;
  color: #161643;
`;

export const PreviewAvailability = styled.span`
  margin-left: 20px;
`;

export const AndMorePreviewText = styled.div`
  color: #2148ff;
  font-size: 13px;
  font-family: ProximaNova-Medium, sans-serif;
  margin-right: 10px;
  text-align: right;
`;

export const RightSideContainerArea = styled.div`
  display: flex;
  margin-left: auto;
  align-items: center;
`;

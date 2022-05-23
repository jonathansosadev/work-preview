import styled from 'styled-components';
import Select from '../Select';
import {components} from 'react-select';

const width = '471px';
export const StyledSelect = styled(Select)`
  min-height: 47px;
  &,
  & .select__menu,
  & .select__menu-list {
    width: ${width};
  }
  & .control-wrapper {
    grid-template-rows: auto minmax(44px, auto) auto;
  }
  & .select__multi-value {
    background-color: #f0f0f8;
    padding-left: 8px;
    padding-right: 4px;
    border: 1px solid #acacd5;
    border-radius: 4px;
    margin: 5px;
  }
  & .select__multi-value__label {
    font-family: ProximaNova-Medium, sans-serif;
    font-size: 16px;
    margin-left: 0;
    padding-left: 0;
    padding-right: 6px;
    color: #161643;
  }
  & .select__multi-value__remove:hover {
    background: transparent;
  }
  & .select__value-container {
    padding: 1px 25px 1px 9px;
  }
`;

export const RemoveIcon = styled.img`
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

export const ClearIndicatorContainer = styled(components.ClearIndicator)`
  position: relative;
  right: 20px;
`;
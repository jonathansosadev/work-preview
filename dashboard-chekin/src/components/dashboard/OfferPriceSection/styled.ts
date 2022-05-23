import styled, {css} from 'styled-components';
import {FieldsVerticalGridLayout} from '../../../styled/common';
import Button from '../Button';
import RawSelect from '../Select';
import DefaultInput, {InputController as RawInput} from '../Input';
import Checkbox from '../Checkbox';
import {InputProps} from '../Input/Input';

const getInputStyles = css<InputProps & {row?: boolean}>`
  ${(props) =>
    props.width &&
    css`
      width: ${props.width}px;
    `}
  ${(props) =>
    props.row &&
    css`
      display: flex;
      align-items: center;
      column-gap: 10px;
      & .label {
        margin-bottom: 0;
      }
    `}
`;

export const OfferPriceGridLayout = styled(FieldsVerticalGridLayout)`
  grid-auto-flow: unset;
  max-height: unset;
  grid-template-columns: 1fr;
`;

export const TypeContainerWrapper = styled.div`
  margin-top: 20px;
  &::before {
    content: '• ';
  }
`;

export const PriceTypeListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 20px;
`;

type PriceTypeRowWrapperProps = {
  gap?: 15 | 30;
  width?: number;
};
export const PriceTypeRowWrapper = styled.div<PriceTypeRowWrapperProps>`
  display: flex;
  flex: 1;
  flex-direction: row;
  justify-content: space-between;
  ${(props) =>
    props.gap &&
    css`
      gap: ${props.gap}px;
    `}
  ${(props) =>
    props.width &&
    css`
      width: ${props.width}px;
    `}
`;

export const UnitSelect = styled(RawSelect)`
  width: 196px;
`;

export const Input = styled(RawInput)`
  ${getInputStyles}
`;
export const RevenueInput = styled(DefaultInput)`
  ${getInputStyles}
`;

export const StyledCheckbox = styled(Checkbox)`
  min-width: 120px;
`;

export const AddButton = styled(Button)`
  display: inline-flex;
  margin-right: auto;
`;

type RemoveButtonProps = {
  isHidden?: boolean;
};
export const RemoveButton = styled.button<RemoveButtonProps>`
  outline: none;
  border: none;
  background: transparent;
  padding: 0;
  height: 20px;
  cursor: pointer;
  transition: box-shadow 0.15s ease-in-out;
  border-radius: 3px;
  display: block;
  align-self: center;
  margin-top: 25px;
  ${(props) =>
    props.isHidden &&
    css`
      visibility: hidden;
    `}
  &:hover {
    box-shadow: 0 3px 3px #0f477734;
  }
  &:active {
    opacity: 0.95;
  }
  & > img {
    height: 20px;
    width: 20px;
  }
`;

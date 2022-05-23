import styled from 'styled-components';
import {BASE_LINK_COLOR} from '../../../styled/global';
import Select from '../Select';
import Input from '../Input';
import Tooltip from '../Tooltip';
import Button from '../Button';
import {ResultInput} from './ResultInput/ResultInput';
import {ErrorMessage} from '../../../styled/common';

type IsDisabled = {
  isDisabled?: boolean;
};

export const ShrinkSelect = styled(Select)`
  width: 205px;
`;

export const InputWrapper = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: auto auto;
`;

export const SubsectionsWrapper = styled.div`
  display: grid;
  row-gap: 30px;
`;

type InputContainerProps = IsDisabled & {
  readOnly?: boolean;
};

export const InputContainer = styled.div<InputContainerProps>`
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 700px 19px max-content;
  align-items: end;

  .label {
    color: ${(props) => props.isDisabled && '#9696b9'};
    cursor: ${(props) => props.readOnly && 'default'};
  }

  .currency {
    color: ${(props) => props.isDisabled && '#9696b9'};
    cursor: ${(props) => props.readOnly && 'default'};
  }

  .wide-input {
    cursor: ${(props) => (props.isDisabled ? 'not-allowed' : 'pointer')};
    cursor: ${(props) => props.readOnly && 'default'};
    width: auto;
  }

  @media (max-width: 1060px) {
    grid-template-columns: 515px 19px max-content;
  }
`;

export const Label = styled.span``;

export const WideInput = styled.label<{invalid?: boolean}>`
  box-sizing: border-box;
  display: flex;
  align-items: flex-end;
  padding: 0 8px 5px 8px;
  border-bottom: 1px solid;
  border-color: ${(props) => (props.invalid ? '#ff2467' : '#e5ecf5')};
  font-family: ProximaNova-Medium, sans-serif;

  .input-wrapper {
    display: flex;
    align-items: flex-end;
  }

  ${Label} {
    white-space: nowrap;
  }
`;

export const ShrinkInput = styled(Input)`
  width: 100%;
  font-size: 16px;
  opacity: 1;
  min-height: 50px;

  .input {
    padding: 0;
    font-family: inherit;
    text-align: right;
    color: ${(props) => props.disabled && '#9696b9'};
    border: none;

    &::placeholder {
      font-family: inherit;
    }
  }
`;

export const Currency = styled.span`
  padding-left: 5px;
`;

export const InputTooltip = styled(Tooltip)`
  margin-left: 3px;
  margin-bottom: 7px;
`;

export const AddServiceBtn = styled(Button)`
  height: 30px;
  margin: 25px 0;
  padding: 0 15px;
`;

export const Divider = styled.div`
  height: 1px;
  width: 640px;
  background-color: #e5ecf5;

  @media (max-width: 1060px) {
    width: 515px;
  }
`;

export const ExtraServiceWrapper = styled.div<InputContainerProps>`
  display: grid;
  grid-template-columns: 640px max-content;
  column-gap: 40px;

  .label {
    color: ${(props) => props.isDisabled && '#9696b9'};
    cursor: ${(props) => props.readOnly && 'default'};
  }

  .currency {
    color: ${(props) => props.isDisabled && '#9696b9'};
    cursor: ${(props) => props.readOnly && 'default'};
  }

  .input {
    cursor: ${(props) => (props.isDisabled ? 'not-allowed' : 'text')};
    cursor: ${(props) => props.readOnly && 'default'};
    color: ${(props) => props.isDisabled && '#9696b9'};
  }

  @media (max-width: 1060px) {
    grid-template-columns: 515px max-content;
  }
`;

export const ExtraServiceInput = styled.div`
  grid-area: 1 / 1 / 2 / 3;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 2fr 1fr min-content;
  align-items: end;
  padding: 0 8px 5px 8px;
  border-bottom: 1px solid #e5ecf5;
  font-family: ProximaNova-Medium, sans-serif;
  cursor: text;

  .input-wrapper {
    display: flex;
    align-items: flex-end;
  }
`;

export const NameInput = styled(ShrinkInput)`
  .input {
    text-align: left;
  }
`;

export const NameError = styled(ErrorMessage)`
  grid-area: 2 / 1 / 3 / 2;
  text-align: left;
`;

export const AmountInput = styled(ShrinkInput)``;

export const AmountError = styled(ErrorMessage)`
  grid-area: 2 / 2 / 3 / 3;
`;

export const RemoveBtn = styled.button`
  align-self: end;
  margin-bottom: 8px;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 15px;
  color: #9696b9;
`;

export const ResultContainer = styled.div`
  margin-top: 10px;
  margin-left: 295px;

  @media (max-width: 1060px) {
    margin-left: 215px;
  }
`;

export const ResultInputWrapper = styled(WideInput)`
  grid-template-columns: max-content 1fr min-content;
  width: 350px;

  & ${Label} {
    font-family: ProximaNova-Bold, sans-serif;
    font-size: 16px;
  }

  .input-wrapper {
    height: 40px;
    min-height: 40px;
  }

  .input {
    color: #161643;
  }

  @media (max-width: 1060px) {
    width: 300px;
  }
`;

export const AmountDueWrapper = styled.div<{redValue: boolean}>`
  display: grid;
  grid-template-columns: max-content max-content;
  column-gap: 35px;

  .input {
    color: ${(props) => props.redValue && '#ff2467'};
  }

  & ${Currency} {
    color: ${(props) => props.redValue && '#ff2467'};
  }
`;

export const MarkPaidBtn = styled.button`
  align-self: end;
  margin-bottom: 5px;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 15px;
  color: ${(props) => (props.disabled ? '#9696b9' : `${BASE_LINK_COLOR}`)};
`;

export const LightResultInput = styled(ResultInput)`
  .label {
    font-family: ProximaNova-Medium, sans-serif;
  }
`;

export const PaymentLinkTitle = styled.div`
  margin-top: 47px;
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 16px;
`;

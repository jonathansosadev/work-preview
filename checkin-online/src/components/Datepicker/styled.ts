import styled, {css} from 'styled-components';
import {device} from '../../styled/device';
import Input from '../Input';
import Select from '../Select';
import {ErrorMessage as BaseErrorMessage} from '../../styled/common';
import {Label as BaseLabel} from '../Input/styled';

export const Label = styled(BaseLabel)``;

type WrapperProps = {
  disabled?: boolean;
};

export const Wrapper = styled.div<WrapperProps>`
  width: 327px;
  min-height: 56px;

  ${props =>
    props.disabled &&
    css`
      cursor: not-allowed;

      & ${Label} {
        opacity: 0.3;
      }
    `};

  @media (max-width: ${device.mobileS}) {
    width: 293px;
  }
`;

export const FieldsWrapper = styled.div`
  display: flex;
  gap: 10px;
  position: relative;
  align-items: center;
`;

export const DateInput = styled(Input)`
  width: 75px;
  min-height: 36px;

  & input {
    padding-right: 5px;
  }

  & ${BaseLabel} {
    display: none;
  }
`;

export const DateSelectWrapper = styled.div`
  display: inline-block;
  position: relative;
`;

export const DateSelect = styled(Select)`
  width: 157px;
  min-height: 36px;
  min-width: 0;

  & .select {
    height: 36px !important;
  }

  & .select__placeholder {
    font-family: SFProDisplay-Medium, sans-serif !important;
    font-size: 18px;
    color: #8181a3 !important;
  }

  & .select__value-container {
    padding-bottom: 0 !important;
  }

  & .select__value-container > div {
    font-size: 18px;
    margin: 0 !important;
  }

  & .select__input {
    padding-top: 3px !important;
  }

  & .select__input input {
    width: 100px !important;
  }

  & .select__input {
    top: -4px !important;
  }

  & .select__menu,
  & .select__menu-list {
    width: 225px !important;
  }

  & .select__control {
    min-height: unset !important;
  }

  @media (max-width: ${device.mobileS}) {
    width: 130px;
  }
`;

export const ErrorMessage = styled(BaseErrorMessage)`
  padding-top: 1px;
`;

export const LabelWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
`;

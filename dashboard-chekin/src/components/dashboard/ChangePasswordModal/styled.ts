import styled from 'styled-components';
import {BaseButton, ModalTwoButtonsWrapper} from '../../../styled/common';
import Input from '../Input';

export const ChangePasswordButton = styled(BaseButton)`
  font-size: 15px;
  color: #002cfa;
  margin-left: 45px;
  padding: 10px 0;
`;

export const ChangePasswordInput = styled(Input)`
  font-family: ProximaNova-Semibold, sans-serif;
  margin: auto !important;
`;

export const ChangePasswordTitle = styled.div`
  font-family: ProximaNova-Bold, sans-serif;
  font-weight: bold;
  font-size: 18px;
  margin: 35px 0;
`;

export const CloseButton = styled(BaseButton)`
  color: #2148ff;
  font-size: 16px;
  margin: 0 auto 45px auto;
  display: block;
  font-family: ProximaNova-Semibold, sans-serif;
`;

export const FieldWrapper = styled.div`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const ChangePasswordModalTwoButtonsWrapper = styled(ModalTwoButtonsWrapper)`
  margin-top: 40px;
`;

import styled from 'styled-components';
import {ModalTwoButtonsWrapper} from '../../../styled/common';
import {Text as ModalText} from '../Modal/styled';
import {CheckboxWrapper as BaseCheckboxWrapper} from '../Checkbox/styled';

export const Text = styled(ModalText)`
  margin: 20px auto 0;
`;

export const ButtonWrapper = styled(ModalTwoButtonsWrapper)`
  margin-top: 10px;
`;

export const CheckboxWrapper = styled.div`
  display: flex;
  justify-content: center;
  padding-top: 10px;
  padding-bottom: 5px;

  & ${BaseCheckboxWrapper} {
    min-width: auto;
  }
`;

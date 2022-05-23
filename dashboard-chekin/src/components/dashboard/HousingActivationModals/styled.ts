import styled from 'styled-components';
import {ModalTwoButtonsWrapper} from '../../../styled/common';

export const ModalButtonsWrapper = styled(ModalTwoButtonsWrapper)`
  margin-top: -30px;
`;

export const ModalThreeButtonsWrapper = styled(ModalTwoButtonsWrapper)`
  & button {
    margin-bottom: 15px;

    &:last-child {
      margin-bottom: 30px;
    }
  }
`;

import styled from 'styled-components';
import {ModalSecondaryButton, ModalButton} from '../../styled/common';

export const Content = styled.main`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin-top: 30px;
`;

type ModalTryAgainButtonProps = {
  hasSibling: boolean;
};

export const ModalTryAgainButton = styled(ModalButton)<ModalTryAgainButtonProps>`
  margin: 0 auto ${props => (props.hasSibling ? 32 : 50)}px;
`;

export const ModalSkipButton = styled(ModalSecondaryButton)`
  margin: 3px auto 32px;
`;

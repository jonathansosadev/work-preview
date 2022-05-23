import styled from 'styled-components';
import {ResolveButton} from '../../../../styled/common';

export const ButtonResend = styled(ResolveButton)<{isSuccess: boolean}>`
  font-size: 16px;
  color: ${(props) => (props.isSuccess ? 'green' : '#2148ff')};

  &:disabled {
    cursor: default;
  }
`;

import styled, {css} from 'styled-components';
import Input from '../Input';
import {device} from '../../styled/device';

export const StyledShortInput = styled(Input)`
  width: 139px;

  ${props =>
    props.disabled &&
    css`
      opacity: 1;
    `};

  @media (max-width: ${device.mobileS}) {
    width: 139px;
  }
`;

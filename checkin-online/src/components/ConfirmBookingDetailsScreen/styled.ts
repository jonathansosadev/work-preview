import styled from 'styled-components';
import {device} from '../../styled/device';

export const LogoPlaceholder = styled.div`
  height: 22px;

  @media (max-width: ${device.tablet}) {
    height: 17px;
  }
`;

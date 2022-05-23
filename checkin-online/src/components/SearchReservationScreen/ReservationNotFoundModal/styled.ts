import styled from 'styled-components';
import {device} from '../../../styled/device';
import Button from '../../Button';

export const Description = styled.div`
  margin: 20px auto 0;
`;

export const ButtonModal = styled(Button)`
  margin: 0 auto 38px;

  @media (max-width: ${device.mobileL}) {
    height: 48px;
    min-width: 211px;
  }
`;

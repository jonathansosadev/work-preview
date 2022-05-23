import styled from 'styled-components';
import Button from '../Button';
import {device} from '../../styled/device';

export const Wrapper = styled.div`
  text-align: center;
`;

export const Icon = styled.img`
  width: 25px;
  height: 21px;
`;

export const DesktopButton = styled(Button)`
  height: 57px;
  background: transparent linear-gradient(166deg, #385cf8 0%, #2148ff 100%) 0 0 no-repeat
    padding-box;
  padding: 0 75px;
  min-width: 0;
  @media (max-width: ${device.mobileL}) {
    display: none;
  }
`;

export const MobileButton = styled(Button)`
  display: none;
  z-index: 2;

  @media (max-width: ${device.mobileL}) {
    display: flex;
    position: fixed;
    right: 17px;
    bottom: 19px;
  }
`;

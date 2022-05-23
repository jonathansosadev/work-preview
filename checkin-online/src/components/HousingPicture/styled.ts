import styled from 'styled-components';
import {device} from '../../styled/device';

export const Wrapper = styled.div`
  text-align: center;
  width: 222px;
  height: 114px;
  line-height: 114px;
  margin: 43px auto 0;

  @media (max-width: ${device.tablet}) {
    margin-top: 26px;
  }
`;

export const HousingLogo = styled.img`
  max-width: 100%;
  max-height: 100%;
`;

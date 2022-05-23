import styled from 'styled-components';
import {device} from '../../styled/device';
import Webcam from '../Webcam';
import {StyledWebcam} from '../Webcam/styled';

export const Content = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-top: -75px;
`;

export const Title = styled.div`
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 16px;
  text-transform: uppercase;
  max-width: 302px;
  margin: 59px auto 0;
  color: #161643;
  cursor: default;

  @media (max-width: ${device.tablet}) {
    margin-top: 34px;
  }
`;

export const Subtitle = styled.div`
  font-family: ProximaNova-Light, sans-serif;
  font-size: 18px;
  max-width: 302px;
  margin: 5px auto 10px;
  color: #161643;
  cursor: default;
`;

export const ButtonWrapper = styled.div`
  margin: 0px auto 35px;
  display: flex;
  justify-content: center;
`;

export const CropImg = styled.img`
  width: 320px;
  height: auto;
  margin: 0 auto;
  display: none;
`;

export const DocumentWebCam = styled(Webcam)`
  & ${StyledWebcam} {
    height: 240px;
    @media (max-width: ${device.tablet}) {
      min-height: 100%;
    }
  }
`;

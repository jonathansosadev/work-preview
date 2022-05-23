import styled from 'styled-components';
import {device} from '../../styled/device';
import Webcam from '../Webcam';
import {StyledWebcam} from '../Webcam/styled';

export const Content = styled.div`
  text-align: center;
  cursor: default;
`;

export const Title = styled.div`
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 16px;
  max-width: 311px;
  margin: -40px auto 0;
  text-transform: uppercase;
  color: #161643;
`;

export const Subtitle = styled.div`
  font-family: ProximaNova-Light, sans-serif;
  font-size: 18px;
  max-width: 400px;
  margin: 0 auto 30px;
  color: #161643;

  @media (max-width: ${device.tablet}) {
    max-width: 311px;
  }
`;

export const SelfieWebcam = styled(Webcam)`
  height: 240px;
  border-radius: 0;

  & ${StyledWebcam} {
    height: 290px;

    @media (max-width: ${device.tablet}) {
      min-height: 220%;
    }
  }
`;

export const SelfieArea = styled.div`
  background-color: transparent;
  border: 3px solid #1a8cff;
  width: 195px;
  height: 195px;
  box-sizing: border-box;
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 2;
  margin: auto;
`;

export const ButtonWrapper = styled.div`
  margin: 0px 0 35px;
  display: flex;
  justify-content: center;
`;

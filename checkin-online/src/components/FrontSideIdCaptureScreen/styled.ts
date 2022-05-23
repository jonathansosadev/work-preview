import Webcam from '../Webcam';
import styled from 'styled-components';
import {device} from '../../styled/device';
import Button from '../Button';
import {StyledWebcam} from '../Webcam/styled';

export const Content = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
`;

export const Title = styled.div`
  margin: -40px auto;
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 20px;
  color: #161643;
  text-align: center;
  cursor: default;
  padding: 0 20px;
  max-width: 320px;
`;

export const Subtitle = styled.div`
  font-family: ProximaNova-Light, sans-serif;
  font-size: 20px;
  text-align: center;
  color: #161643;
  cursor: default;
  padding: 0 20px;
  max-width: 320px;
  margin: 40px auto;
`;

export const Hint = styled.div`
  text-align: center;
  color: #2699fb;
  font-family: ProximaNova-Regular, sans-serif;
  cursor: default;
  max-width: 320px;
  margin: -10px auto 14px;
`;

export const ButtonIcon = styled.img`
  height: 24px;
  width: 24px;
  vertical-align: middle;
`;

export const ButtonWrapper = styled.div`
  margin: 20px 0 35px;

  & > button {
    width: 320px;

    @media (max-width: ${device.mobileS}) {
      width: 300px;
    }
  }
`;

export const SkipButton = styled(Button)`
  margin-top: 20px;
`;

export const DocumentWebCam = styled(Webcam)`
  & ${StyledWebcam} {
    height: 240px;
    @media (max-width: ${device.tablet}) {
      min-height: 100%;
    }
  }
`;

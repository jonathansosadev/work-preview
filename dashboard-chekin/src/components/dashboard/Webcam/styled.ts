import styled from 'styled-components';
import ReactWebcam from 'react-webcam';
import {DEVICE} from 'styled/device';

export const Wrapper = styled.div`
  display: flex;
  position: relative;
  margin: 0 auto;
  width: 283px;
  height: 191px;
  overflow: hidden;
  text-align: center;
  border-radius: 6px;
  justify-content: center;
  z-index: 1;
`;

export const StyledWebcam = styled(ReactWebcam)`
  height: 260px;
  z-index: 1;
  background-color: #c4e6ff;
  flex: 1;
  align-self: center;

  @media (max-width: ${DEVICE.tablet}) {
    min-height: 200%;
  }
`;

export const CameraAccessText = styled.div`
  box-sizing: border-box;
  width: 306px;
  padding: 15px;
  font-family: ProximaNova-Light, sans-serif;
  font-size: 16px;
  color: #161643;
  text-align: center;
`;

export const CameraAccessLink = styled.a`
  color: #2699fb;
  text-decoration: none;
`;

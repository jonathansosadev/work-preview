import styled, {css} from 'styled-components';
import ReactWebcam from 'react-webcam';
import {device} from '../../styled/device';

export const ScanArea = styled.img`
  position: absolute;
  width: 303px;
  height: 199px;
  z-index: 2;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  margin: auto;

  @media (max-width: ${device.mobileS}) {
    width: 283px;
    height: 180px;
  }
`;

type WrapperProps = {
  isMirroredInCSS: boolean;
};

export const Wrapper = styled.div<WrapperProps>`
  display: flex;
  position: relative;
  margin: 0 auto;
  width: 320px;
  height: 216px;
  overflow: hidden;
  text-align: center;
  border-radius: 6px;
  justify-content: center;
  z-index: 1;

  ${props =>
    props.isMirroredInCSS &&
    css`
      &,
      & ${ScanArea} {
        transform: rotateY(180deg);
      }
    `}

  @media (max-width: ${device.mobileS}) {
    width: 300px;
  }
`;

export const StyledWebcam = styled(ReactWebcam)`
  height: 260px;
  z-index: 1;
  background-color: #c4e6ff;
  flex: 1;
  align-self: center;

  @media (max-width: ${device.tablet}) {
    min-height: 200%;
  }
`;

export const CameraAccessText = styled.div`
  box-sizing: border-box;
  width: 306px;
  margin: 0 auto;
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

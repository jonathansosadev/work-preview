import styled from 'styled-components';
import Webcam from '../Webcam';
import Button from '../Button';
import {device} from '../../styled/device';

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: default;
`;

const Text = styled.div`
  font-family: ProximaNova-Light, sans-serif;
  font-size: 20px;
  color: #161643;
  text-align: center;

  & b {
    font-weight: unset;
    font-family: ProximaNova-Bold, sans-serif;
  }
`;

export const Title = styled(Text)`
  max-width: 306px;
  margin: 0 auto;
`;

export const Hint = styled.div`
  text-align: center;
  font-size: 18px;
  color: #2699fb;
  font-family: ProximaNova-Regular, sans-serif;
  cursor: default;
  max-width: 320px;
  margin: 33px auto 14px;
`;

export const ButtonWrapper = styled.div`
  margin: 48px auto 35px;

  & > button {
    width: 320px;
    margin: 0 auto;

    @media (max-width: ${device.mobileS}) {
      width: 300px;
    }
  }
`;

export const ButtonIcon = styled.img`
  height: 24px;
  width: 24px;
  vertical-align: middle;
`;

export const EyeIcon = styled.img`
  margin-top: 6px;
`;

type DetectionWebcamProps = {
  isMobile: boolean;
};

export const DetectionWebcam = styled(Webcam)<DetectionWebcamProps>`
  & video {
    transform: ${props => props.isMobile && 'rotateY(180deg)'} scaleX(-1) !important;
  }
`;

export const MRZModalCloseButton = styled.button`
  position: absolute;
  right: 10px;
  top: 30px;
  height: 34px;
  width: 34px;
  background-color: #1a8cff;
  border-radius: 100%;
  border: none;
  outline: none;
  cursor: pointer;
  user-select: none;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    opacity: 1;
  }

  & > img {
    vertical-align: middle;
  }
`;

export const MRZIllustrationWrapper = styled.div`
  margin: 105px 0 90px;
  overflow-x: hidden;
  position: relative;
`;

export const MRZIllustration = styled.img`
  position: relative;
  right: -15px;
`;

export const ErrorModalFirstButton = styled(Button)`
  margin: 0 auto 20px;
`;

export const ContractIcon = styled.img`
  margin-top: 6px;
`;

import styled from 'styled-components';
import {default as BaseProgressCircle} from '../ProgressCircle';
import {device} from '../../styled/device';
import {OriginalButton} from '../Button';

export const Content = styled.div`
  text-align: center;
  cursor: default;
`;

export const Image = styled.img`
  width: 84px;
  height: 84px;

  @media (max-width: ${device.tablet}) {
    margin-top: 27px;
  }
`;

export const Title = styled.div`
  font-family: ProximaNova-Bold, sans-serif;
  color: #161643;
  margin-top: 17px;
  font-size: 25px;
`;

export const Subtitle = styled.div`
  font-family: ProximaNova-Light, sans-serif;
  font-size: 17px;
  color: #161643;
  max-width: 317px;
  margin: 0 auto;
`;

export const ButtonWrapper = styled.div`
  margin: 80px 0 35px;
  display: flex;
  justify-content: center;

  @media (max-width: ${device.tablet}) {
    margin-top: 70px;
  }
`;

export const ScanResultContainer = styled.div`
  width: 317px;
  position: relative;
  margin: 40px auto 0;
  min-height: 180px;
  user-select: none;
`;

export const DocumentResultArea = styled.div`
  position: absolute;
  left: 5px;
  top: 24px;
  display: flex;
  width: 113px;
  flex-direction: column;
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 17px;
  color: #161643;
  align-items: center;
`;

type ResultImageProps = {
  image: string;
  mirror: boolean;
};
export const ResultImage = styled.div<ResultImageProps>`
  background-image: url(${props => props.image});
  transform: ${props => props.mirror && 'rotateY(180deg)'};
  box-shadow: 0 16px 16px #2699fb1a;
  width: 100%;
  height: 113px;
  border: 5px solid white;
  background-color: white;
  border-radius: 50%;
  margin-bottom: 13px;
  background-size: cover;
  background-position: center;
`;

export const SelfieResultArea = styled(DocumentResultArea)`
  left: unset;
  right: 5px;
`;

export const ProgressArea = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  margin: auto;
  z-index: 10;
`;

export const ProgressCircle = styled(BaseProgressCircle)`
  margin: auto;
`;

export const TitleIcon = styled.img`
  height: 25px;
  max-width: 25px;
  margin-left: 7px;
  vertical-align: middle;
`;

export const TitleSuccessIcon = styled(TitleIcon)`
  margin-top: -6px;
`;

export const TitleErrorIcon = styled(TitleIcon)``;

export const TryButton = styled(OriginalButton)`
  margin: 0 auto 50px;
`;

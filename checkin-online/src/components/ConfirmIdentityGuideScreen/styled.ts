import styled from 'styled-components';
import Button from '../Button';
import {device} from '../../styled/device';

export const Content = styled.div`
  text-align: center;
  max-width: 320px;
  margin: 0 auto 100px;
  cursor: default;

  @media (max-width: ${device.tablet}) {
    max-width: 307px;
  }
`;

export const Image = styled.img`
  margin-top: 45px;
  width: 115px;
  height: 105px;
  user-select: none;
  margin-right: 12px;
`;

export const Title = styled.div`
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 21px;
  color: #161643;
  margin: 43px auto 0;
`;

export const Step = styled.div`
  font-family: ProximaNova-Light, sans-serif;
  color: #161643;
  font-size: 20px;
  margin-top: 30px;
  text-align: left;
`;

export const SubmitButton = styled(Button)`
  margin: 80px auto 0;
`;

export const SkipButton = styled(Button)`
  margin: 10px auto 0;
`;

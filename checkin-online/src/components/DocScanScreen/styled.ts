import styled from 'styled-components';
import {device} from '../../styled/device';

export const Content = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
`;

export const Title = styled.div`
  margin: 70px auto 0;
  padding: 0 20px;
  font-family: ProximaNova-Light, sans-serif;
  font-size: 20px;
  color: #161643;
  text-align: center;
  cursor: default;
  max-width: 320px;
  @media (max-width: ${device.tablet}) {
    margin-top: 40px;
  }
`;

export const Hint = styled.div`
  text-align: center;
  color: #2699fb;
  font-family: ProximaNova-Regular, sans-serif;
  cursor: default;
  max-width: 320px;
  margin: 23px auto 14px;
`;

export const ButtonIcon = styled.img`
  height: 24px;
  width: 24px;
  vertical-align: middle;
`;

export const ButtonWrapper = styled.div`
  margin: 68px 0 35px;
  & > button {
    width: 320px;
    @media (max-width: ${device.mobileS}) {
      width: 300px;
    }
  }
`;

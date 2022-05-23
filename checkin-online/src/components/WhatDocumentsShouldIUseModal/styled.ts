import styled from 'styled-components';
import BaseButton from '../Button';

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: default;
`;

export const Icon = styled.img`
  width: 93px;
  height: 84px;
  margin-top: 45px;
`;

export const Title = styled.div`
  font-size: 21px;
  margin: 45px auto 30px;
  max-width: 271px;
  font-family: ProximaNova-Bold, sans-serif;
  color: #161643;
`;

export const Text = styled.div`
  font-size: 18px;
  color: #161643;
  font-family: ProximaNova-Light, sans-serif;
  max-width: 268px;
  margin: 0 auto;
  text-align: center;

  & b {
    font-weight: unset;
    font-family: ProximaNova-Medium, sans-serif;
  }
`;

export const Button = styled(BaseButton)`
  margin: 20px auto 40px;
`;

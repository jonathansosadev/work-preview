import styled from 'styled-components';
import Button from '../Button';

export const Content = styled.div`
  max-width: 1047px;
  margin: 21px auto 0;
  cursor: default;
  padding: 0 120px 230px;
  text-align: center;
  position: relative;
`;

export const Header = styled.div`
  font-size: 21px;
  font-family: ProximaNova-Bold, sans-serif;
  color: #161643;
`;

export const SubHeader = styled.div`
  font-size: 18px;
  font-family: ProximaNova-Bold, sans-serif;
  color: #161643;
  position: relative;
  width: fit-content;
  margin: 49px auto 9px;
`;

export const SubHeaderImg = styled.img`
  position: absolute;
  width: 16px;
  height: 16px;
  left: -20px;
  top: 50%;
  transform: translateY(-50%);
`;

export const PlanDescription = styled.div`
  font-size: 16px;
  font-family: ProximaNova-Regular, sans-serif;
  color: #161643;
  margin-bottom: 67px;
`;

export const OkButton = styled(Button)`
  margin: 70px auto 34px;
  border: 1px solid #385cf8;

  div {
    font-size: 16px;
    margin: 0 auto;
    height: auto;
  }
`;

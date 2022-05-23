import styled from 'styled-components';
import Button from '../Button';

export const StyledCard = styled.div<{$loading: boolean}>`
  box-shadow: 0 0 10px #2148ff1a;
  border-radius: 6px;
  width: 266px;
  min-height: 329px;
  padding: 18px 23px 31px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  transition: opacity 0.5s ease-in;
  opacity: ${(props) => props.$loading && 0.4};
`;

export const Header = styled.div``;

export const Title = styled.h6`
  text-align: left;
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 16px;
  color: #161643;
  opacity: 1;
  margin: 0;
`;

export const Body = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-top: 25px;
`;

export const BodyImageWrapper = styled.div`
  text-align: center;
  height: 80px;
`;

export const BodyImage = styled.img`
  margin: 0 auto;
`;

export const BodyCount = styled.h6`
  margin: 0;
  text-align: center;
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 63px;
  color: #161643;
  line-height: 1;
  word-break: break-all;
`;

export const BodySubTitle = styled.p`
  text-align: center;
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 16px;
  color: #9696b9;
  opacity: 1;
  margin: 0;
`;

export const CardButton = styled(Button)`
  margin: auto auto 0;

  & .label {
    margin: 0 auto;
  }
`;

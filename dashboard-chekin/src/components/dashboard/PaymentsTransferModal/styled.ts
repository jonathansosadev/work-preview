import styled from 'styled-components';
import {ErrorMessage} from '../../../styled/common';

export const Content = styled.div`
  min-width: 794px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;

  & ${ErrorMessage} {
    position: absolute;
    right: 0;
  }
`;

export const Main = styled.main`
  text-align: left;
`;

export const Title = styled.header`
  margin: 20px 0;
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 21px;
  color: #161643;
  text-align: center;
`;

export const Subtitle = styled.div`
  font-family: ProximaNova-Light, sans-serif;
  color: #161643;
  font-size: 18px;
  text-align: center;
`;

export const BalanceLabel = styled.div`
  color: #161643;
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 16px;
  margin-bottom: 6px;
  margin-top: 40px;
  text-align: left;
`;

export const Balance = styled.div`
  font-family: ProximaNova-Semibold, sans-serif;
  color: #161643;
  font-size: 31px;
  margin-bottom: 27px;
`;

export const Currency = styled.span`
  color: #161643;
  font-size: 16px;
  font-family: ProximaNova-Semibold, sans-serif;
  vertical-align: middle;
`;

export const ButtonsWrapper = styled.div`
  margin-top: 58px;
  margin-bottom: 40px;

  & button {
    justify-content: center;
    min-width: 190px;

    &:first-child {
      min-height: 53px;
      margin-bottom: 25px;
    }
  }
`;

export const CloseButton = styled.button`
  position: absolute;
  right: 19px;
  top: 16px;
  width: 36px;
  height: 38px;
  box-shadow: 0 10px 10px #2148ff1a;
  border-radius: 6px;
  text-align: center;
  outline: none;
  padding: 0;
  border: none;
  background-color: white;
  cursor: pointer;

  &:hover {
    opacity: 0.7;
  }

  &:active {
    opacity: 1;
  }

  & > img {
    height: 15px;
    vertical-align: middle;
  }
`;

export const SuccessTitle = styled.header`
  color: #161643;
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 21px;
  margin-bottom: 17px;

  & > img {
    height: 21px;
    width: 21px;
    margin-right: 5px;
    vertical-align: text-top;
  }
`;

export const SuccessText = styled.div`
  font-family: ProximaNova-Light, sans-serif;
  font-size: 18px;
  color: #161643;
  max-width: 448px;
  margin: 0 auto;
`;

export const TransferIcon = styled.img`
  width: 84px;
  height: 84px;
  margin-top: 45px;
  margin-bottom: 15px;
`;

export const LoaderWrapper = styled.div`
  margin-top: 58px;
  margin-bottom: 40px;
`;

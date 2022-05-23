import styled from 'styled-components';
import BaseButton from '../Button';
import {SendEmailBtn} from '../SendEmailBtn/SendEmailBtn';

export const CopyButton = styled(BaseButton)`
  height: 31px;
  white-space: nowrap;
  padding: 0 0 0 5px;
  min-width: auto;
  cursor: copy;

  &:active {
    border-color: #385cf8;
  }

  & img {
    position: relative;
    margin-right: 5px;
    top: -2px;
  }
`;

export const KeyItemWrapper = styled.div`
  display: flex;
  min-height: 110px;
  flex-direction: column;
  box-shadow: 0 0 10px #6fc2ff33;
  border-radius: 6px;
  padding: 12px 20px;
  row-gap: 6px;
`;

export const OpenButton = styled(CopyButton)`
  cursor: pointer;
  & > img {
    top: -1px;
  }
`;

export const KeyType = styled.div`
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 15px;
  color: #9696b9;
`;

export const KeyActions = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px 0 4px;
`;

export const KeyName = styled.div`
  font-family: ProximaNova-Semibold, sans-serif;
  word-break: break-all;
  font-size: 16px;
`;

export const KeyItemFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0 0;
  border-top: 1px solid rgba(0, 66, 154, 0.2);
  margin-top: auto;
`;

export const KeyDetails = styled.div`
  font-family: ProximaNova-Medium, sans-serif;
  word-break: break-all;
  font-size: 16px;
`;

export const LoaderWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

export const Subtitle = styled.div`
  display: flex;
  align-items: center;
  color: #161643;
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 16px;
  & > img {
    margin-right: 10px;
  }

  
`;

export const SendEmailButtonStyled = styled(SendEmailBtn)`
  font-family: ProximaNova-Semibold, sans-serif;
  box-shadow: none;
  border: none;
  padding: 0;
  height: 25px;

  & img {
    width: 18px;
    height: 16.5px;
    margin-right: 6px;
  }
  &:hover {
    opacity: 0.7;
  }
`;

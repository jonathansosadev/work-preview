import styled from 'styled-components';
import Button from '../Button';

export const CancelFeatureButton = styled(Button)`
  min-width: 172px;
`;

export const Header = styled.header`
  font-family: ProximaNova-Bold, sans-serif;
  color: #161643;
  font-size: 18px;
  margin-top: 43px;
  margin-bottom: 35px;
`;

export const ConnectedPropertiesSection = styled.section`
  width: 370px;
  border-right: 1px solid #f4f4f6;
  display: flex;
  flex-direction: column;

  & header {
    display: inline-block;
    font-family: ProximaNova-Bold, sans-serif;
    color: #161643;
    font-size: 15px;
    border-bottom: 1px solid #161643;
    margin-bottom: 35px;
  }
`;

export const AddButton = styled.button`
  outline: none;
  border: none;
  background: transparent;
  height: 30px;
  cursor: pointer;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 15px;
  padding: 0;
  display: inline-flex;
  vertical-align: middle;
  align-items: center;

  &:hover > img {
    box-shadow: 0 3px 3px #0f477734;
  }

  &:active > img {
    opacity: 0.95;
  }

  & > img {
    border-radius: 3px;
    height: 20px;
    width: 20px;
    margin-right: 8px;
    transition: box-shadow 0.15s ease-in-out;
  }
`;

export const ConnectedHousing = styled.div`
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 16px;
  color: #161643;
  position: relative;
  width: 265px;
  border-bottom: 1px solid rgb(222 228 237);
  margin-bottom: 30px;

  > div {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    padding-right: 30px;
  }
`;

export const CloseButton = styled.button`
  cursor: pointer;
  position: absolute;
  right: 0;
  bottom: 3px;
  padding: 0;
  border-radius: 3px;
  outline: none;
  border: none;
  background-color: transparent;

  & > img {
    border-radius: 3px;
    vertical-align: middle;
    transition: box-shadow 0.15s ease-in-out;
    height: 20px;
    width: 20px;
  }

  &:hover > img {
    box-shadow: 0 3px 3px #0f477734;
  }

  &:active > img {
    opacity: 0.95;
  }
`;

export const LoaderWrapper = styled.div`
  position: absolute;
  right: -30px;
  bottom: 0;
  padding: 0;
`;

export const PriceAside = styled.aside`
  padding-left: 63px;

  & > header {
    font-family: ProximaNova-Medium, sans-serif;
    color: #161643;
    font-size: 16px;
    margin-bottom: 5px;
  }
`;

export const PriceAmount = styled.div`
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 48px;
  color: #161643;
  margin-left: -3px;
  height: 59px;
`;

export const PriceDetails = styled.div`
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 15px;
  color: #9696b9;
  margin-top: -7px;

  &::first-letter {
    text-transform: capitalize;
  }
`;

export const Content = styled.div`
  display: flex;
`;

export const MainLoaderWrapper = styled.div`
  margin-top: 13%;
  text-align: center;
`;

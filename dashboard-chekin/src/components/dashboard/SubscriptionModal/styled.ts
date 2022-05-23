import React from 'react';
import styled from 'styled-components';
import {baseContentStyle} from '../Modal';

export const contentStyle: React.CSSProperties = {
  ...baseContentStyle,
  width: 869,
  minHeight: 471,
  padding: '35px 76px 45px 63px',
  boxSizing: 'border-box',
  textAlign: 'left',
};

export const Title = styled.div`
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 20px;
  color: #161643;
  margin-bottom: 5px;
`;

export const Subtitle = styled.div`
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 16px;
  color: #161643;
  margin-bottom: 50px;

  > span {
    color: #385cf8;
  }
`;

export const InputWrapper = styled.div`
  width: 250px;
  position: relative;
`;

type InputProps = {
  error: string;
};

export const Input = styled.input<InputProps>`
  height: 48px;
  border: none;
  outline: none;
  width: 100%;
  border-bottom: 1px solid ${(props) => (props.error ? '#ff2467' : '#e2e7ef')};
  padding: 16px 75px 3px 0;
  box-sizing: border-box;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 31px;
  color: #161643;

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  -moz-appearance: textfield;

  &::placeholder {
    color: #9696b9;
    font-size: 16px;
    font-family: ProximaNova-Medium, sans-serif;
  }
`;

export const InputLabel = styled.label`
  font-family: ProximaNova-Medium, sans-serif;
  color: #161643;
  font-size: 16px;
`;

type SpinnerButtonProps = {
  onClick: (e: MouseEvent) => void;
};

export const SpinnerButton = styled.button<SpinnerButtonProps>`
  background-color: #9696b9;
  border-radius: 3px;
  width: 32px;
  height: 17px;
  outline: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  font-family: ProximaNova-Bold, sans-serif;
  padding: 1px 7px;
  display: inline-flex;
  justify-content: center;
  align-items: center;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    opacity: 1;
  }
`;

export const SpinnerButtonsWrapper = styled.div`
  position: absolute;
  top: 23px;
  right: 0;
  text-align: right;
  display: inline-flex;
  align-items: center;

  & > ${SpinnerButton}:first-child {
    margin-right: 8px;
  }
`;

export const SpinnerIcon = styled.img`
  user-select: none;
  width: 8px;
  margin-top: 1px;
`;

export const Main = styled.main`
  display: flex;
  justify-content: space-between;
`;

export const PriceContainer = styled.aside`
  border: 1px solid #2194f7;
  border-radius: 3px;
  box-shadow: 0 7px 7px #2148ff1a;
  text-align: center;
  padding: 28px 16px 16px;
  box-sizing: border-box;
  width: 272px;
  min-height: 245px;
`;

export const PriceTitle = styled.div`
  color: #161643;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 16px;
  margin-bottom: 2px;
`;

export const Price = styled.div`
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 48px;
  color: #161643;
`;

export const Currency = styled(Price)`
  font-size: 38px;
  display: inline;
`;

export const PriceSubtitle = styled.div`
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 15px;
  color: #9696b9;
  margin-bottom: 41px;
  margin-top: -6px;
`;

export const LoaderWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 23%;
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

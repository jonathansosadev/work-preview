import React from 'react';
import styled from 'styled-components';
import Button from '../Button';
import {baseContentStyle } from '../Modal';

export const contentStyle: React.CSSProperties = {
  ...baseContentStyle,
  width: 676,
  minHeight: 481,
  padding: '35px 20px 34px 33px',
  boxSizing: 'border-box',
  position: 'relative',
  textAlign: 'left',
  cursor: 'default',
  boxShadow: '0px 10px 10px #2148ff1a',
};
export const ModalTextContainer = styled.div`
  &:first-child{
    margin-top:15px;
  }
`

export const ModalText = styled.div`
  font-family: ProximaNova-Medium, sans-serif;
  color: #161643;
  font-size: 16px;
  margin-bottom: 20px;
`;

export const ModalTextFirst = styled.div`
  font-family: ProximaNova-Medium, sans-serif;
  color: #161643;
  font-size: 16px;
  margin-bottom: 20px;
  margin-top: 15px;
`;

export const PropertiesList = styled.form`
  
`;

export const PropertyItem = styled.div`
  display: grid;
  grid-template-columns: repeat(2,1fr);
  margin-bottom: 20px;
`;

export const SuperHogItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 95%;
`;

export const SubmitButton = styled(Button)`
  color: #fff;
  height: 40px;
  border: none;
  margin: 28px auto 0;
  text-align: center;
  background: transparent linear-gradient(164deg ,#385cf8 0%,#2148ff 100%) 0 0 no-repeat padding-box;
  box-shadow: 0 3px 4px #00020334;
  min-width: 188px;
  border-radius: 6px;
  display: flex;
  justify-content: center;

  div {
    height: auto;
    font-size: 16px;
    font-family: ProximaNova-Bold, sans-serif;
  }

  &:hover {
    box-shadow: none;
  }
`;

export const InvalidSelect = styled.div`
  text-align: right;
  font-family: ProximaNova-Semibold,sans-serif;
  color: #ff2467;
  font-size: 12px;
  margin-top: 3px;
`


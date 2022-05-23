import React from 'react';
import styled from 'styled-components';
import Button from '../Button';
import {baseContentStyle} from '../Modal';
import {ModalTwoButtonsWrapper} from '../../../styled/common';

export const contentStyle: React.CSSProperties = {
  ...baseContentStyle,
  minWidth: 730,
  minHeight: 483,
};

export const Title = styled.div`
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 18px;
  color: #161643;
  margin-top: 31px;
  margin-bottom: 68px;
  text-align: center;
`;

export const Form = styled.form``;

export const Grid = styled.div`
  display: grid;
  grid-template-rows: 70px 70px;
  grid-template-columns: repeat(auto-fit, 293px);
  grid-column-gap: 56px;
  justify-content: center;
  grid-row-gap: 15px;
  grid-auto-flow: column;
`;

export const ButtonsWrapper = styled(ModalTwoButtonsWrapper)`
  margin-top: 61px;
`;

export const SubmitButton = styled(Button)`
  min-width: 160px;
  min-height: 48px;
  font-size: 16px;
  justify-content: center;
`;

import React from 'react';
import styled from 'styled-components';
import Button from '../Button';
import {baseContentStyle} from '../Modal';
import {ModalTwoButtonsWrapper} from '../../../styled/common';

export const contentStyle: React.CSSProperties = {
  ...baseContentStyle,
  maxWidth: 660,
  padding: '31px 35px',
};

export const Title = styled.div`
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 18px;
  color: #161643;
  text-align: center;
`;

export const Subtitle = styled.div`
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 16px;
  color: #6b6b95;
  margin: 14px auto 18px;
  text-align: center;
`;

export const WrapperControllerCheckbox = styled.div`
  margin: 27px 0;
`;

export const Form = styled.form``;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-column-gap: 56px;
  justify-content: center;
  grid-row-gap: 20px;
`;

export const ButtonsWrapper = styled(ModalTwoButtonsWrapper)`
  margin: 0 auto;
  height: auto;
`;

export const WarningButtonsWrapper = styled(ModalTwoButtonsWrapper)`
  margin: -12px auto 60px;
  height: auto;
`;

export const SubmitButton = styled(Button)`
  min-width: 160px;
  min-height: 48px;
  font-size: 16px;
  justify-content: center;
`;

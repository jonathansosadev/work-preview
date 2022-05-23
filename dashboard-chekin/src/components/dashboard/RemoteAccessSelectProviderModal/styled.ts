import React from 'react';
import styled from 'styled-components';
import ModalButton from '../ModalButton';
import {baseContentStyle} from '../Modal';

export const contentStyle: React.CSSProperties = {
  ...baseContentStyle,
  minHeight: 517,
  width: 306,
  paddingBottom: 140,
  boxSizing: 'border-box',
  marginTop: 128,
};

export const Container = styled.div``;

export const FieldsWrapper = styled.div`
  margin-top: 27px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin-bottom: 19px;
`;

export const SingleFieldWrapper = styled.div`
  margin-bottom: 17px;
`;

export const ButtonsWrapper = styled.div`
  margin-top: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: absolute;
  right: 0;
  left: 0;
  bottom: 0;
  height: 140px;

  & > button:first-child {
    margin-bottom: 20px;
  }
`;

type NextButtonProps = {
  visible: boolean;
};

export const NextButton = styled(ModalButton)<NextButtonProps>`
  visibility: ${(props) => !props.visible && 'hidden'};
`;

export const ManualBoxButton = styled.button`
  outline: none;
  background-color: transparent;
  border: none;
  text-decoration: none;
  color: #385cf8;
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 16px;
  margin-top: 35px;
  display: inline-block;
  cursor: pointer;
  user-select: none;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 1;
  }
`;

export const MarketplaceConnectionText = styled.div`
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 16px;
  padding: 30px 30px 25px;
  color: #161643;
`;

export const CancelButtonWrapper = styled(ButtonsWrapper)`
  > button {
    margin-top: auto;
  }
`;

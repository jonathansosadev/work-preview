import React from 'react';
import styled from 'styled-components';
import {BaseButton} from '../../../styled/common';

export const defaultOverlayStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.7)',
  overflowY: 'auto',
  paddingBottom: 31,
};

export const defaultContentStyle: React.CSSProperties = {
  minWidth: 340,
  minHeight: 436,
  padding: 0,
  height: 'auto',
  width: 'auto',
  border: 'none',
  backgroundColor: '#ffffff',
  textAlign: 'center',
  marginTop: 110,
  position: 'relative',
  boxShadow: '0 30px 30px #2148ff1a',
  borderRadius: 6,
};

type WrapperProps = {
  zIndex?: number | string;
};

export const Wrapper = styled.div<WrapperProps>`
  & .popup-overlay {
    z-index: ${(props) => props.zIndex} !important;
  }
`;

export const IconWrapper = styled.div`
  text-align: center;
  margin-top: 52px;
  user-select: none;
`;

export const Title = styled.div`
  text-align: center;
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 18px;
  padding: 0 25px;
  color: #161643;
  cursor: default;
  max-width: 212px;
  margin: 20px auto 0;
  font-weight: 900;
`;

export const Text = styled.div`
  font-family: ProximaNova-Medium, sans-serif;
  color: #161643;
  font-size: 16px;
  max-width: 244px;
  margin: 20px auto 52px;
  box-sizing: border-box;
  text-align: center;
  cursor: default;

  & > b {
    font-family: ProximaNova-Bold, sans-serif;
    font-weight: normal;
  }
`;

export const SelectCheckboxesModalStyles = {
  ...defaultContentStyle,
  'box-sizing': 'border-box',
  display: 'flex',
  'flex-direction': 'column',
  'align-items': 'center',
  width: 420,
  'text-align': 'initial',
};

export const CloseButton = styled(BaseButton)`
  text-align: center;
  padding: 10px;
  position: absolute;
  top: 10px;
  right: 10px;

  & > img {
    height: 15px;
    vertical-align: middle;
  }
`;

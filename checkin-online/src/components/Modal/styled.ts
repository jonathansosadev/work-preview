import React from 'react';
import styled from 'styled-components';
import {BaseButton} from '../../styled/common';

export const overlayStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.95)',
  overflowY: 'auto',
  paddingBottom: 91,
};

export const contentStyle: React.CSSProperties = {
  minWidth: 306,
  minHeight: 365,
  padding: 0,
  height: 'auto',
  width: 'auto',
  border: 'none',
  borderRadius: 6,
  boxShadow: '0px 30px 30px #2699FB1A',
  backgroundColor: '#ffffff',
  textAlign: 'center',
  marginTop: 130,
  position: 'relative',
};

type WrapperProps = {
  zIndex?: number | string;
};

export const Wrapper = styled.div<WrapperProps>`
  & .popup-overlay {
    z-index: ${props => props.zIndex} !important;
  }
`;

export const IconWrapper = styled.div`
  text-align: center;
  margin-top: 52px;
  user-select: none;

  & > img {
    height: 84px;
    width: 84px;
  }
`;

export const Title = styled.div`
  text-align: center;
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 24px;
  padding: 0 25px;
  color: #161643;
  cursor: default;
  max-width: 240px;
  margin: 20px auto 0;
`;

export const Text = styled.div`
  font-family: ProximaNova-Light, sans-serif;
  color: #161643;
  font-size: 18px;
  max-width: 254px;
  margin: 10px auto 47px;
  box-sizing: border-box;
  text-align: center;
  cursor: default;

  & > b {
    font-family: ProximaNova-Medium, sans-serif;
    font-weight: normal;
  }
`;

export const CloseButton = styled(BaseButton)`
  position: absolute;
  text-align: center;
  padding: 10px;
  top: 10px;
  right: 10px;

  & > img {
    height: 15px;
    vertical-align: middle;
  }
`;

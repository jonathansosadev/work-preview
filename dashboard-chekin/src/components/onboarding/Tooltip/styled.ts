import React from 'react';
import styled from 'styled-components';

export const overlayStyle: React.CSSProperties = {
  background: 'transparent',
};

export const contentStyle: React.CSSProperties = {
  fontFamily: 'ProximaNova-Light, sans-serif',
  fontSize: '15px',
  color: '#161643',
  padding: '30px',
  border: 'none',
  borderRadius: 3,
  boxShadow: '0 15px 15px 0 rgba(38, 153, 251, 0.1)',
  backgroundColor: '#ffffff',
  zIndex: 99999,
  width: 250,
  textAlign: 'center',
};

export const Wrapper = styled.span`
  & .popup-content :first-child {
    border: none !important;
    box-shadow: 0 15px 15px 0 rgba(38, 153, 251, 0.1) !important;
  }
`;

export const TooltipTrigger = styled.img`
  height: 19px;
  width: 19px;
  z-index: 3;
  cursor: pointer;
  border-radius: 50%;
  box-shadow: 0 5px 5px 0 rgba(38, 153, 251, 0.1);
`;

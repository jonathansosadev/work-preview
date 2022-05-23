import React from 'react';
import styled from 'styled-components';

export const overlayStyle: React.CSSProperties = {
  background: 'transparent',
};

export const contentStyle: React.CSSProperties = {
  fontFamily: 'ProximaNova-Regular, sans-serif',
  fontSize: '15px',
  color: '#161643',
  padding: '20px',
  border: 'none',
  borderRadius: 6,
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

  & b {
    font-family: ProximaNova-Bold, sans-serif;
    font-weight: normal;
  }
`;

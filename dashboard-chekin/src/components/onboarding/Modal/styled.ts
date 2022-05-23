import styled from 'styled-components';
import React from 'react';

export const overlayStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.65)',
  overflowY: 'auto',
  paddingBottom: 91,
};

export const contentStyle: React.CSSProperties = {
  minWidth: 264,
  minHeight: 262,
  padding: 0,
  height: 'auto',
  width: 'auto',
  border: 'none',
  borderRadius: 8,
  boxShadow: '0 15px 15px 0 rgba(38, 153, 251, 0.1)',
  backgroundColor: '#ffffff',
  textAlign: 'center',
  marginTop: 137,
  position: 'relative',
};

export const ContentWrapper = styled.div`
  padding: 30px 17px 17px;
`;

export const CloseIconWrapper = styled.div`
  width: 22px;
  height: 22px;
  background-color: #2960f5;
  border-radius: 50%;
  text-align: center;
  line-height: 22px;
  position: absolute;
  top: 12px;
  right: 12px;
  cursor: pointer;
  user-select: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    opacity: 1;
  }
`;

export const CloseIcon = styled.img`
  width: 10px;
  height: 10px;
`;

type WrapperProps = {
  zIndex?: number;
};

export const Wrapper = styled.div<WrapperProps>`
  & .popup-overlay {
    z-index: ${(props) => props.zIndex} !important;
  }
`;

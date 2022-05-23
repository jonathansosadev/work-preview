import React from 'react';
import styled from 'styled-components';
import {baseContentStyle} from '../../Modal';

export const contentStyle: React.CSSProperties = {
  ...baseContentStyle,
  maxWidth: 702,
  width: 'auto',
  textAlign: 'left',
  padding: '25px 50px 50px',
  lineHeight: 1.4,
};

export const H3 = styled.h3`
  margin: 0;
`;

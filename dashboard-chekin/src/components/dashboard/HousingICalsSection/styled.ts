import styled from 'styled-components';
import {FieldsVerticalGridLayout} from '../../../styled/common';

export const TooltipContentItem = styled.div`
  font-size: 16px;
  font-family: ProximaNova-Light, sans-serif;
  margin-bottom: 15px;
`;

export const Content = styled.div`
  & ${FieldsVerticalGridLayout} {
    margin-top: 30px;
  }
`;

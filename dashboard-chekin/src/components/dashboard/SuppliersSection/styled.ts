import styled from 'styled-components';
import {BaseButton} from '../../../styled/common';

export const Subtitle = styled.div`
  font-family: ProximaNova-Regular, sans-serif;
  color: #6b6b95;
  font-size: 16px;
  display: flex;
  justify-content: space-between;
`;

export const AddButton = styled(BaseButton)`
  color: #002cfa;
  font-size: 15px;
  font-family: ProximaNova-Semibold, sans-serif;
  padding: 8px 0 8px 8px;
  margin-top: -8px;

  > img {
    margin-right: 7px;
    position: relative;
    top: 2px;
  }
`;

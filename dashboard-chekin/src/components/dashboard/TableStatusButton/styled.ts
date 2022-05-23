import styled from 'styled-components';
import {BaseButton} from '../../../styled/common';

export const StyledButton = styled(BaseButton)<{$active: boolean; $interactive: boolean}>`
  color: ${(props) => (props.$active ? '#161643' : '#9696B9')};
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 15px;
  display: inline-flex;
  align-items: center;
  padding: 10px 0;

  &:hover {
    opacity: ${(props) => !props.$interactive && 1};
  }

  > img {
    margin-right: 8px;
    border-radius: 100%;
    width: 20px;
    height: 20px;
    box-shadow: ${(props) => props.$active && '0px 3px 6px #00000029'};
  }
`;

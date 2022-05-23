import styled, {css} from 'styled-components';
import {BaseButton} from '../../../styled/common';
import {TableButtonProps} from './TableButton';

export const StyledButton = styled(BaseButton)<Pick<TableButtonProps, 'danger'>>`
  box-shadow: 0 3px 3px #00020312;
  border: 1px solid #2148ff;
  border-radius: 3px;
  color: #002cfa;
  font-family: ProximaNova-Semibold, sans-serif;
  min-width: 75px;
  padding: 4px 9px;
  box-sizing: border-box;

  ${(props) =>
    props.danger &&
    css`
      color: #ff2467;
      border-color: #ff2467;
    `}
`;

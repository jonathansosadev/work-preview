import styled from 'styled-components';
import Tooltip from '../Tooltip';

export const TitleLink = styled.a`
  font-family: ProximaNova-Medium, sans-serif;
  color: #385cf8;
  font-size: 14px;
  margin-left: 8px;
  transition: all 0.07s ease-in-out;
  z-index: 1;

  &:hover {
    opacity: 0.88;
  }

  &:active {
    opacity: 1;
  }
`;

export const StyledTooltip = styled(Tooltip)`
  margin-left: 5px;
`;

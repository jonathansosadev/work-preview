import styled from 'styled-components';
import Tooltip from '../Tooltip';

export const OptionName = styled.div`
  color: #161643;
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 16px;
  margin-bottom: 18px;
`;

export const Hr = styled.hr`
  margin: 31px 79px 31px 0;
  border: none;
  border-bottom: 1px solid rgb(214 214 223);
`;

export const StyledTooltip = styled(Tooltip)`
  display: inline-block;
  margin-left: 7px;
`;

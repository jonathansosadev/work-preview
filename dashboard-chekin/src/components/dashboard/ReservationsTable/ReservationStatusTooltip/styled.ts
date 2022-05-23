import styled from 'styled-components';
import Tooltip from '../../Tooltip';

export const TooltipWrapper = styled(Tooltip)`
  margin-left: 8px;

  & .content {
    width: 640px;
    top: 260px;
    right: 90px;
    padding: 33px 36px;
  }
`;

export const Title = styled.h4`
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 18px;
  margin: 0;
`;

export const Body = styled.div`
  margin-top: 22px;
`;

export const Row = styled.div`
  display: flex;
  align-items: center;
  column-gap: 30px;
  padding: 23px 8px;
  border-bottom: 1px solid #16164317;

  &:last-child {
    border-bottom: none;
  }
`;

export const RowItem = styled.div`
  display: flex;
  align-items: center;
  font-family: ProximaNova-Medium, sans-serif;
  column-gap: 9px;
`;

export const RowTitle = styled.span`
  font-family: ProximaNova-Bold, sans-serif;
`;

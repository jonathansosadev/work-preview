import styled from 'styled-components';
import {DEVICE} from 'styled/device';
import {Link} from 'react-router-dom';

export const Wrapper = styled.section`
  width: 100%;
  padding: 39px 31px 44px;
  background-color: white;
  box-shadow: 0 0 10px #2148ff1a;
  border-radius: 6px;
  margin-bottom: 23px;
  box-sizing: border-box;
  cursor: default;
  max-width: ${DEVICE.yFullHD};
`;

export const Title = styled.div`
  display: flex;
  align-items: center;
  font-size: 18px;
  font-family: ProximaNova-Bold, sans-serif;
  color: #161643;
  margin-bottom: 25px;
  user-select: none;
`;

export const TitleTooltip = styled.div`
  margin-left: 10px;
`;

export const SubtitleWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 25px;
`;

export const TooltipWrapper = styled.div`
  margin-left: 15px;
`;

export const Subtitle = styled.div`
  font-size: 16px;
  font-family: ProximaNova-Regular, sans-serif;
  color: #6b6b95;
`;

export const TitleLink = styled(Link)`
  text-decoration: none;
  color: #002cfa;
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 14px;
  margin-left: 25px;

  &:hover {
    opacity: 0.7;
  }

  &:active {
    opacity: 1;
  }
`;

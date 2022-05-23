import styled from 'styled-components';
import {BASE_FONT_COLOR} from '../../../../styled/global';

export const Subtitle = styled.div`
  margin-bottom: 26px;
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 16px;
  color: #161643;
`;

export const NewTemplateLink = styled.a`
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 16px;
  color: #385cf8;
`;

export const ListContainer = styled.div`
  display: grid;
  grid-auto-rows: auto;
  row-gap: 10px;
`;

export const ItemContainer = styled.div`
  display: grid;
  grid-template-columns: minmax(min-content, 800px) min-content;
  align-items: center;
  column-gap: 20px;
  height: 100%;
`;

export const ItemWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 40px;
  padding: 12px 16px;
  background: #fdfdfd;
  border: 0.5px solid #9696b9;
  border-radius: 3px;
  cursor: pointer;
`;

export const ItemTitle = styled.div`
  margin-bottom: 7px;
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 16px;
  color: ${BASE_FONT_COLOR};
`;

export const TimingOptions = styled.div`
  display: flex;
  flex-wrap: wrap;
  max-width: 100%;
`;

export const TimingOption = styled.span`
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 14px;
  color: #385cf8;
  margin-right: 10px;

  &:after {
    content: ',';
  }

  &:last-child {
    margin-right: 0;

    &:after {
      content: none;
    }
  }
`;

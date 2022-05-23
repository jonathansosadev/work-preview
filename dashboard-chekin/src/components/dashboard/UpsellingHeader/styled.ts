import styled from 'styled-components';
import HeadingSelect, {getHeadingSelectStyles} from '../HeadingSelect';

export const Container = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  flex: 1;
  margin-bottom: 27px;
`;

const headingSelectWidth = 180;
export const StyledHeadingSelect = styled(HeadingSelect)`
  width: ${headingSelectWidth}px;
  ${getHeadingSelectStyles({
    widthList: headingSelectWidth,
    widthHeading: headingSelectWidth,
  })};

  & .select {
    width: 140px;
  }

  .select__single-value,
  .select__placeholder {
    padding-right: 0;
  }
`;

export const Title = styled.div`
  color: #161643;
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 21px;
  margin-bottom: 6px;
  cursor: default;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

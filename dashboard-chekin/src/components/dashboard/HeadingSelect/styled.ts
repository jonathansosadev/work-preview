import styled, {css} from 'styled-components';
import Select, {DisplayIcon} from '../Select';

const width = 140;

type GetHeadingSelectStyles = {
  widthList?: number;
  widthHeading?: number;
};
export const getHeadingSelectStyles = ({
  widthList = width,
  widthHeading = width,
}: GetHeadingSelectStyles) => css`
  width: ${widthHeading}px;

  & .select {
    width: ${widthHeading}px;
  }

  & .select__control {
    padding: 0 10px;
    &,
    &:hover {
      background: transparent;
      border: none;
    }
  }

  & .select__menu,
  & .select__menu-list {
    width: ${widthList}px;
  }

  & .select__value-container {
    padding: 0;
  }

  & .select__single-value,
  & .select__placeholder {
    font-family: ProximaNova-Semibold, sans-serif;
    font-size: 15px;
  }
`;

export const Wrapper = styled.div`
  position: relative;
  box-sizing: border-box;
  cursor: pointer;
  width: ${width};
  min-height: 42px;

  & ${DisplayIcon} {
    right: 0;
  }
`;

export const StyledSelect = styled(Select)<{widthList?: number}>`
  ${getHeadingSelectStyles};
`;

import styled from 'styled-components';
import {FixedSizeList} from 'react-window';
import Select, {selectListWidth} from '../Select';

export const StyledSelect = styled(Select)``;

export const MenuMessage = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 35px 27px 38px 32px;
  box-sizing: border-box;
`;

export const MenuItemLoadingMessage = styled(MenuMessage)`
  border-top: 1px solid #f2f4f8;
  margin-top: 17px;
  margin-left: 16px;
  margin-right: 30px;
  padding: 35px 0 38px 15px;
  width: calc(100% - 43px) !important;
`;

export const Menu = styled(FixedSizeList)`
  padding: 17px 0 19px 16px;
  border-radius: 0 0 8px 8px;
  box-sizing: border-box;
  width: ${selectListWidth} !important;

  & .select__option:last-child {
    border-bottom-color: #f2f4f8 !important;
  }
`;

type MenuItemProps = {
  $isLastChild: boolean;
};

export const MenuItem = styled.div<MenuItemProps>`
  padding: 18px 27px 19px 16px;
  box-sizing: border-box;

  & .select__option:last-child {
    border-bottom-color: ${(props) => props.$isLastChild && 'transparent !important'};
  }
`;

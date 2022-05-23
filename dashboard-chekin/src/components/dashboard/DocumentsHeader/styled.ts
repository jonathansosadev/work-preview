import {Link} from 'react-router-dom';
import styled, {css} from 'styled-components';

export const Item = styled(Link)`
  font-family: ProximaNova-Medium, sans-serif;
  color: #9696b9;
  font-size: 15px;
  cursor: pointer;
  border-bottom: 1px solid transparent;

  &:hover {
    border-color: #9696b9;
  }

  &:active {
    color: #161643;
    border-color: #161643;
  }
`;

type ItemProps = {
  active?: boolean;
};

export const ItemWrapper = styled.div<ItemProps>`
  padding: 0 12px;

  & ${Item} {
    ${(props) =>
      props.active &&
      css`
        font-family: ProximaNova-Bold, sans-serif;
        color: #161643;
        border-bottom: 2px solid #161643;

        &:hover {
          border-color: #161643;
        }
      `};
  }
`;

export const Container = styled.nav`
  height: 64px;
  background-color: #f2f9ff;
  display: flex;
  align-items: center;
  justify-content: center;
`;

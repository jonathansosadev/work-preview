import styled from 'styled-components';
import {NavLink} from 'react-router-dom';

const dividerColor = '#ededf4';

export const StyledNavLink = styled(NavLink).attrs({
  activeClassName: 'account-active-link',
})<{$activeCursor: 'pointer' | 'default'}>`
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 15px;
  color: #9696b9;
  display: grid;
  grid-template-rows: 1px minmax(53px, auto);
  grid-template-columns: 38px 1fr;
  text-decoration: none;
  align-items: center;
  box-sizing: border-box;
  padding: 0 7px;

  &:not(.account-active-link):hover {
    opacity: 0.8;
  }

  &::before {
    content: '';
    grid-column: 1 / 3;
    height: 1px;
    width: 164px;
    background: ${dividerColor};
  }

  &.account-active-link {
    font-family: ProximaNova-Bold, sans-serif;
    color: #161643;
    background: #f0f0f9;
    border-right: 4px solid #2148ff;
    cursor: ${(props) => props.$activeCursor};

    &::before {
      background: transparent;
    }
  }

  &.account-active-link,
  &.account-active-link + & {
    &::before {
      background: transparent;
    }
  }

  & > :first-child {
    justify-self: center;
  }
`;

export const NestedLinksContainer = styled.div`
  grid-column: 1 / 3;

  & + ${StyledNavLink}::before {
    background: transparent;
  }
`;

export const NestedStyledNavLink = styled(StyledNavLink)`
  grid-template-columns: 1fr;
  padding-right: 12px;
  padding-left: 52px;

  &::before {
    margin-left: -22px;
  }

  &,
  &.account-active-link {
    background: #f8f8ff;
    border-right: none;
  }

  &.account-active-link,
  &.account-active-link + & {
    &::before {
      background: ${dividerColor};
    }
  }
`;

export const Container = styled.nav`
  min-width: 210px;
  margin-right: 42px;

  & ${StyledNavLink}:first-child::before {
    background: transparent;
  }
`;

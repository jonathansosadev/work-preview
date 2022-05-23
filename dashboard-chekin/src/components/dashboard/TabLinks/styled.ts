import styled, {css} from 'styled-components';
import {NavLink} from 'react-router-dom';
import {BaseButton} from '../../../styled/common';

const baseStyles = css`
  font-family: ProximaNova-Medium, sans-serif;
  color: #6b6b95;
  font-size: 15px;
  padding: 0 20px 5px;

  &::after {
    content: '';
    display: block;
    height: 3px;
    margin-top: 5px;
    width: 100%;
    border-radius: 2px 2px 0 0;
  }

  &::before {
    display: block;
    content: attr(title);
    font-family: ProximaNova-Semibold, sans-serif;
    height: 1px;
    color: transparent;
    overflow: hidden;
    visibility: hidden;
  }

  &:last-child {
    padding-right: 44px;
  }
`;

const activeStyles = css`
  font-family: ProximaNova-Semibold, sans-serif;
  color: #161643;
  cursor: default;

  &::after {
    background-color: #2148ff;
  }
`;

const hoverStyles = css`
  color: rgba(22, 22, 67, 0.75);

  &::after {
    background-color: rgba(33, 72, 255, 0.3);
  }
`;

export const StyledNavLink = styled(NavLink).attrs({
  activeClassName: 'active-tab-link',
})`
  ${baseStyles};
  text-decoration: none;

  &.active-tab-link {
    ${activeStyles};
  }

  &:not(.active-tab-link):hover {
    ${hoverStyles}
  }
`;

export const NavButton = styled(BaseButton)<{$active: boolean}>`
  ${baseStyles};

  ${(props) =>
    props.$active
      ? css`
          ${activeStyles};
        `
      : css`
          &:hover {
            ${hoverStyles};
          }
        `}
`;

export const Container = styled.div`
  display: flex;
  justify-content: flex-end;

  & ${StyledNavLink}:first-child {
    padding-left: 0;
  }

  & ${StyledNavLink}:last-child {
    padding-right: 0;
  }
`;

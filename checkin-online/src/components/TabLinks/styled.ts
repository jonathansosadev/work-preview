import styled, {css} from 'styled-components';
import {NavLink} from 'react-router-dom';
import {BaseButton} from '../../styled/common';
import {device} from '../../styled/device';

export const Wrapper = styled.div`
  position: relative;
`;

const baseStyles = css`
  font-family: ProximaNova-Medium, sans-serif;
  color: #6b6b95;
  font-size: 15px;
  padding: 0 20px 5px;

  @media (min-width: ${device.mobileL}) {
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
  }

  @media (max-width: ${device.mobileL}) {
    padding: 22px 0 30px 0;
    font-size: 20px;
    display: block;
    color: #161643;
  }
`;

const activeStyles = css`
  font-family: ProximaNova-Semibold, sans-serif;
  color: #161643;
  cursor: default;

  @media (min-width: ${device.mobileL}) {
    &::after {
      background-color: #2148ff;
    }
  }

  @media (max-width: ${device.mobileL}) {
    font-family: ProximaNova-Bold, sans-serif;
  }
`;

const hoverStyles = css`
  color: rgba(22, 22, 67, 0.75);

  @media (min-width: ${device.mobileL}) {
    &::after {
      background-color: rgba(33, 72, 255, 0.3);
    }
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

  ${props =>
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

export const Container = styled.div<{isVisibleOnMobile: boolean}>`
  display: flex;
  justify-content: flex-end;

  & ${StyledNavLink}:first-child {
    padding-left: 0;
  }

  & ${StyledNavLink}:last-child {
    padding-right: 0;
  }

  @media (max-width: ${device.mobileL}) {
    display: ${props => (props.isVisibleOnMobile ? 'block' : 'none')};
    width: 237px;
    max-height: 340px;
    overflow-y: auto;
    padding: 26px 23px 23px 34px;
    flex-direction: column;
    justify-content: flex-start;
    position: absolute;
    right: 0;
    z-index: 100;
    top: 35px;
    background: white;
    box-shadow: 0 5px 5px #2699fb1a;

    & ${StyledNavLink} {
      border-bottom: 1px solid rgb(246 246 248);
    }

    & ${StyledNavLink}:last-child {
      border-bottom: none;
    }
  }
`;

export const MobileMenuButton = styled(BaseButton)`
  font-family: ProximaNova-Medium, sans-serif;
  color: #2148ff;
  font-size: 18px;
  display: none;
  padding: 10px 0 0 10px;

  & > img {
    height: 15px;
    vertical-align: middle;
  }

  @media (max-width: ${device.mobileL}) {
    display: block;
  }
`;

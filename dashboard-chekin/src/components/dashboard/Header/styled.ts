import styled, {css} from 'styled-components';
import {NavLink} from 'react-router-dom';
import {DEVICE} from 'styled/device';
import HeaderItem from '../HeaderItem';
import {ToggleWrapper} from '../HeaderItem/styled';

export const HeaderWrapper = styled.div`
  width: 100%;
  z-index: 300;
  background: transparent linear-gradient(95deg, #385cf8 0%, #395bf8 47%, #163ae2 100%) 0
    0 no-repeat padding-box;
  opacity: 1;
  position: relative;
  height: 75px;
  min-height: 75px;
`;

export const Grid = styled.div`
  max-width: ${DEVICE.laptopM};
  margin: auto;
  display: grid;
  grid-template-columns: 95px 1fr auto;
  align-items: center;
  height: 100%;
  padding: 0 20px;
`;

export const LogoImage = styled.img`
  max-width: 75px;
  max-height: 50px;
`;

export const UserMenuWrapper = styled.div`
  display: flex;
  align-items: center;
`;

export const HeaderNavigationMenuWrapper = styled.nav`
  justify-content: flex-start;
  align-items: center;
  display: grid;
  width: 100%;
  grid-auto-flow: column;
  margin-left: -20px;
`;

export const UserMenuItemText = styled.div`
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 15px;
  color: #ffffff;
  margin-left: 7px;
  align-items: center;
  display: flex;
`;

export const MoreImg = styled.img`
  height: 20px;
  width: 4px;
  margin-left: 21px;
`;

type HeaderItemProps = {
  $active?: boolean;
};

const activeHeaderItemOpacity = 0.7;
const activeHoveredHeaderItemOpacity = 0.9;

export const HeaderItemImage = styled.img<HeaderItemProps>`
  opacity: ${(props) => props.$active && activeHeaderItemOpacity};
`;

export const UserHeaderItemContentWrapper = styled.div<HeaderItemProps>`
  display: flex;
  opacity: ${(props) => props.$active && activeHeaderItemOpacity};

  ${(props) =>
    !props.$active &&
    css`
      &:hover {
        opacity: ${activeHeaderItemOpacity};
      }

      &:active {
        opacity: ${activeHoveredHeaderItemOpacity};
      }
    `}
`;

export const HeaderText = styled.span``;

export const HeaderMainNavLinkTag = styled.div`
  position: absolute;
  top: 11px;
  right: 0;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 12px;
  color: #002cfa;
  background-color: #fdfdff;
  box-shadow: 0 3px 4px #00020334;
  border-radius: 2px;
  padding: 0 4px;
`;

export const HeaderNavLink = styled(NavLink).attrs({
  activeClassName: 'header-active-link',
})`
  &.header-active-link {
    color: #ffffff;
    font-family: ProximaNova-Bold, sans-serif;

    &,
    & ${ToggleWrapper} {
      cursor: default;
    }
  }

  &:not(.header-active-link) {
    &:hover :not(${HeaderMainNavLinkTag}) {
      opacity: ${activeHeaderItemOpacity};
    }

    &:active :not(${HeaderMainNavLinkTag}) {
      opacity: ${activeHoveredHeaderItemOpacity};
    }
  }
`;

export const HeaderMainNavLink = styled(HeaderNavLink)`
  text-decoration: none;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 15px;
  color: #dfdfec;
  opacity: 1;
  text-transform: capitalize;
  cursor: pointer;
  user-select: none;
  padding: 26px;
  position: relative;

  &::after {
    display: block;
    content: attr(title);
    font-family: ProximaNova-Bold, sans-serif;
    height: 1px;
    color: transparent;
    overflow: hidden;
    visibility: hidden;
  }

  @media (max-width: 900px) {
    padding-left: 15px;
    padding-right: 15px;
  }
`;

export const HeaderItemsDivider = styled.div`
  width: 1px;
  height: 23px;
  background-color: white;
  opacity: 0.2;
  margin: 0 -1px;
  margin-left: 15px;
`;

export const UserHeaderItem = styled(HeaderItem)`
  & ${ToggleWrapper} {
    padding-left: 25px;
    padding-right: 0;
  }
`;

export const UserHeaderItemImage = styled(HeaderItemImage)`
  margin-top: 1px;

  &:hover {
    opacity: 1;
  }
`;

import styled from 'styled-components';
import {NavLink} from 'react-router-dom';

export const Container = styled.div`
  height: 42px;
  background: #f4f6f8 0 0 no-repeat padding-box;
  border: 1px solid #e7ebef;
  border-radius: 6px;
  width: min-content;
  display: flex;
  align-items: center;
  box-sizing: border-box;
`;

export const StyledNavLink = styled(NavLink).attrs({
  activeClassName: 'active-tab-button-link',
})`
  text-decoration: none;
  border-radius: 6px;
  font-size: 15px;
  color: #6b6b95;
  padding: 8px 16px;
  border: 1px solid transparent;
  box-sizing: border-box;
  margin: 2px;
  white-space: nowrap;
  height: 36px;
  font-family: ProximaNova-Medium, sans-serif;

  &.active-tab-button-link {
    font-family: ProximaNova-Bold, sans-serif;
    color: #ffffff;
    cursor: default;
    background: linear-gradient(192deg, #385cf8 0%, #2148ff 100%);
    box-shadow: 0 3px 4px #00020334;
    border-color: #2148ff;
  }

  &:not(.active-tab-button-link):hover {
    background: linear-gradient(
      192deg,
      rgba(56, 92, 248, 0.35) 0%,
      rgba(33, 72, 255, 0.35) 100%
    );
    color: #ffffff;
  }

  &::after {
    display: block;
    content: attr(title);
    font-family: ProximaNova-Bold, sans-serif;
    height: 1px;
    color: transparent;
    overflow: hidden;
    visibility: hidden;
  }
`;

export const Divider = styled.div`
  width: 1px;
  background: #9696b9;
  opacity: 0.16;
  height: 23px;
`;

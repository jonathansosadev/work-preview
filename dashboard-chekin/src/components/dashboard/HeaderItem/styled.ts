import styled from 'styled-components';

export const Container = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

export const ToggleWrapper = styled.button`
  outline: none;
  border: none;
  background-color: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  user-select: none;
  padding: 26px 15px;
`;

export const MenuItem = styled.div`
  cursor: pointer;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 15px;
  color: #161643;
  padding: 23px 0;
  text-transform: capitalize;
  user-select: none;

  &:hover {
    color: #385cf8;
  }

  & > div {
    padding-left: 11px;
  }
`;

export const Menu = styled.div`
  position: absolute;
  top: 60px;
  right: 0;
  cursor: default;
  background-color: #ffffff;
  box-shadow: 0 30px 30px #2148ff1a;
  border-radius: 0 0 8px 8px;
  opacity: 1;
  z-index: 2;
  padding: 12px 27px 14px 16px;
  width: 157px;
  margin-bottom: 25px;

  & ${MenuItem}:not(:last-child) {
    padding-bottom: 22px;
    border-bottom: 1px solid #9696b91c;
  }
`;

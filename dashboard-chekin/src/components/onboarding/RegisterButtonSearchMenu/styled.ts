import styled from 'styled-components';
import {Link} from 'react-router-dom';

type TriggerButtonProps = {
  active?: boolean;
  invalid?: boolean;
};

export const RelativeWrapper = styled.span`
  position: relative;
  width: 107px;
  height: 27px;
  display: inline-block;
  margin-left: 15px;
  margin-bottom: -1px;
`;

export const TriggerButton = styled.button<TriggerButtonProps>`
  position: absolute;
  top: 0;
  left: 0;
  width: 107px;
  height: 27px;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 12px;
  font-weight: 500;
  border-radius: 4px;
  color: #ffffff;
  border: none;
  cursor: pointer;
  box-shadow: 0 6px 6px 0 rgba(157, 184, 208, 0.07);
  text-transform: uppercase;
  outline: none;
  background-color: ${(props) => (props.active ? '#748d9f' : '#2960F5')};

  &:hover {
    opacity: 0.9;
  }
`;

export const Menu = styled.div`
  width: 334px;
  z-index: 10;
  min-height: 165px;
  position: absolute;
  box-shadow: 0 15px 15px 0 rgba(38, 153, 251, 0.1);
  top: 40px;
  left: -140px;
  box-sizing: border-box;
  padding: 25px 0 0 37px;
  background-color: #fff;
  border-radius: 6px;
`;

export const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
`;

export const Option = styled.div`
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 19px;
  text-align: left;
  font-weight: 500;
  line-height: 1.18;
  padding: 19px 9px 18px;
  color: #161643;
`;

export const EmptyOption = styled(Option)`
  opacity: 0.5;
  font-size: 18px;
`;

export const Divider = styled.div`
  width: 140px;
  background-color: rgba(231, 235, 241, 0.51);
  height: 1px;
`;

export const SearchIcon = styled.img`
  height: 16px;
  width: 16px;
  position: absolute;
  top: 6px;
  left: 8px;
`;

export const SearchInput = styled.input`
  outline: none;
  border: none;
  width: 140px;
  height: 30px;
  position: absolute;
  top: 0;
  left: 32px;

  &,
  &::placeholder {
    font-family: ProximaNova-Medium, sans-serif;
    font-size: 19px;
    font-weight: 500;
    line-height: 1.18;
    text-align: left;
    color: #2960f5;
  }
`;

export const InputRelativeWrapper = styled.div`
  width: 140px;
  height: 30px;
  position: relative;
  padding-bottom: 18px;
`;

export const MenuItems = styled.div`
  max-height: 255px;
  overflow-y: auto;
  padding-bottom: 31px;
`;

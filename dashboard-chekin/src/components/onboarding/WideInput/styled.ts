import styled from 'styled-components';
import {DEVICE} from '../../../styled/device';

type ActiveProps = {
  active?: boolean;
};

export const Wrapper = styled.div`
  max-width: 471px;
  height: 87px;
  position: relative;
  margin: auto;
`;

export const StyledInput = styled.input<ActiveProps>`
  width: 100%;
  box-sizing: border-box;
  height: 100%;
  border-radius: 3px;
  outline: none;
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 26px;
  color: #161643;
  padding: 41px 19px 14px;
  background-color: white;
  transition: box-shadow 0.08s ease-in-out !important;
  box-shadow: 0 15px 15px 0
    ${(props) => (props.active ? 'transparent' : 'rgba(38, 153, 251, 0.1)')};
  border: solid ${(props) => (props.active ? `2px #161643` : '1px #2960F5')};

  &:hover {
    box-shadow: none;
  }

  &::placeholder {
    width: 28px;
    height: 32px;
    font-family: ProximaNova-Regular, sans-serif;
    font-size: 26px;
    color: #161643;
  }
`;

export const Hint = styled.div<ActiveProps>`
  position: absolute;
  user-select: none;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 19px;
  top: 10px;
  left: 19px;
  pointer-events: none;
  color: ${(props) => (props.active ? '#161643' : '#2960F5')};

  @media (max-width: ${DEVICE.mobileL}) {
    top: 5px;
  }
`;

export const Label = styled.div`
  position: absolute;
  user-select: none;
  top: 14px;
  right: 45px;
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 13px;
  text-align: right;
  pointer-events: none;
  color: #2960f5;

  @media (max-width: ${DEVICE.mobileL}) {
    left: 19px;
    right: unset;
    top: 25px;
  }
`;

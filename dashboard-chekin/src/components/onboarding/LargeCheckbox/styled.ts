import styled, {css} from 'styled-components';
import {DEVICE} from '../../../styled/device';

export const AcceptIconImg = styled.img`
  margin: 3px 0 0 2px;
  width: 18px;
  height: 16px;
  user-select: none;
`;

type CheckboxProps = {
  disabled?: boolean;
  checked?: boolean;
};

export const Checkbox = styled.div<CheckboxProps>`
  width: 24px;
  height: 24px;
  margin-right: 29px;
  box-sizing: border-box;
  box-shadow: 0 5px 5px 0 rgba(38, 153, 251, 0.1);
  border: 1px solid #2960f5;
  background-color: white;
  transition: all 0.1s ease-in-out;

  ${(props) =>
    props.disabled &&
    css`
      opacity: 0.3;
    `};

  ${(props) =>
    props.checked &&
    css`
      box-shadow: none;
      border: 1px solid #2960f5;
      background-color: #2960f5;
    `};
`;

type CheckboxWrapperProps = {
  disabled?: boolean;
};

export const CheckboxWrapper = styled.div<CheckboxWrapperProps>`
  font-family: ProximaNova-Light, sans-serif;
  cursor: pointer;
  text-align: left;
  color: #161643;

  > div {
    display: inline-block;
    vertical-align: top;
  }

  ${(props) =>
    props.disabled &&
    css`
      opacity: 0.3;
      cursor: not-allowed;
    `};
`;

export const Label = styled.div`
  width: 300px;
  padding-top: 6px;
  font-family: ProximaNova-Light, sans-serif;
  font-size: 19px;
  font-weight: 300;
  line-height: 13px;
  word-wrap: break-word;
  user-select: none;
  color: #161643;

  @media (max-width: ${DEVICE.mobileM}) {
    width: 240px;
  }
`;

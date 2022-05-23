import styled, {css} from 'styled-components';
import {DEVICE} from '../../../styled/device';

export const AcceptIconImg = styled.img`
  user-select: none;
  margin: 2px 1px;
  width: 16px;
  height: 14px;
`;

type BoxProps = {
  disabled?: boolean;
  isSelected?: boolean;
};

export const Box = styled.div<BoxProps>`
  width: 19px;
  height: 19px;
  box-sizing: border-box;
  margin-right: 11px;
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
    props.isSelected &&
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
  padding: 0;
  cursor: pointer;
  font-size: 12px;
  font-weight: 300;
  text-align: left;
  min-width: 275px;
  color: #161643;

  > div {
    display: inline-block;
    vertical-align: middle;
  }

  @media (max-width: ${DEVICE.mobileM}) {
    min-width: 295px;
  }

  ${(props) =>
    props.disabled &&
    css`
      opacity: 0.3;
      cursor: not-allowed;
    `};
`;

export const Label = styled.div`
  width: 185px;
  font-family: ProximaNova-Light, sans-serif;
  font-size: 13px;
  font-weight: 300;
  line-height: 13px;
  word-wrap: break-word;
  user-select: none;
`;

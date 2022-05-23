import styled, {css} from 'styled-components';
import {TooltipAlignment} from './Tooltip';

type WrapperProps = {
  isMouseOver?: boolean;
};

export const Wrapper = styled.div<WrapperProps>`
  position: relative;

  ${(props) =>
    props.isMouseOver &&
    css`
      & ${ContentWrapper} {
        padding: 20px;
      }
      &:hover ${ContentWrapper} {
        display: initial;
      }
    `}
`;

type TriggerProps = {
  active?: boolean;
};

export const CloseIcon = styled.img`
  position: absolute;
  width: 20px;
  height: 20px;
  right: 10px;
  top: 10px;
  cursor: pointer;
  border-radius: 3px;
  transition: box-shadow 0.15s ease-in-out;
  box-shadow: 0 10px 10px #2148ff1a;
`;

type ContentWrapperProps = {
  alignment: TooltipAlignment;
  show: boolean;
  isMouseOver?: boolean;
};

const contentWidth = 257;
export const ContentWrapper = styled.div<ContentWrapperProps>`
  position: absolute;
  left: 32px;
  width: ${contentWidth}px;
  top: 50%;
  cursor: default;
  transform: translateY(-50%);
  padding: 45px 18px 21px 29px;
  box-shadow: 0 10px 10px #2148ff1a;
  background-color: white;
  border-radius: 6px;
  font-size: 16px;
  font-family: ProximaNova-Regular, sans-serif;
  z-index: 999;
  box-sizing: border-box;
  color: #161643;

  display: ${(props) => (props.show ? 'initial' : 'none')};
  text-align: ${(props) => props.isMouseOver && 'center'};

  ${(props) =>
    props.alignment === 'left' &&
    css`
      left: unset;
      right: 32px;
    `}

  ${(props) =>
    props.alignment === 'bottom' &&
    css`
      top: calc(100% + 15px);
      left: unset;
      right: 0;
      transform: none;
    `}
`;

export const Trigger = styled.div<TriggerProps>`
  cursor: pointer;
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 16px;
  transition: all 0.15s ease-in-out;
  user-select: none;
  color: ${(props) => (props.active ? '#385cf8' : '#9696B9')};
`;

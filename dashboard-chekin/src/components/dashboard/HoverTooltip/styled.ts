import styled from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  align-items: center;
`;

type HoverTooltipProps = {
  open: boolean;
  width?: number;
};
export const HoverTooltipStyled = styled.div<HoverTooltipProps>`
  position: absolute;
  cursor: default;
  right: 0;
  width: ${(props) => props.width || 200}px;
  top: 30px;
  padding: 35px 36px 32px;
  box-shadow: 0 30px 30px #2148ff1a;
  box-sizing: border-box;
  background-color: white;
  border-radius: 6px;
  font-size: 14px;
  font-family: ProximaNova-Regular, sans-serif;
  z-index: 999;
  color: #161643;
  transition: opacity 0.15s ease-in-out;
  opacity: ${(props) => (props.open ? 1 : 0)};
  pointer-events: ${(props) => !props.open && 'none'};
`;

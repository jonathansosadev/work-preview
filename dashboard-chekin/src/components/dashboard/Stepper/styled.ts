import styled, {css} from 'styled-components';

export const Wrapper = styled.div<{hidden?: boolean}>`
  display: flex;
  align-items: center;
  grid-column-gap: 6px;
`;

export const StepPoint = styled.div<{active?: boolean}>`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 14px;
  color: #6b6b95;
  width: 25px;
  height: 25px;
  flex-shrink: 0;
  flex-grow: 0;
  border: 2px solid #ffffff;
  box-shadow: 0 0 0 1px #dfdfea;
  border-radius: 50%;
  background-repeat: no-repeat;
  background-position: center center;
  background-color: #dfdfea;
  background-size: 50% 50%;
  box-sizing: border-box;
  outline: none;
  transition: all 0.15s ease;

  ${(props) =>
    props.active &&
    css`
      font-family: ProximaNova-Bold, sans-serif;
      box-shadow: 0 0 0 1px #002cfa;
      background-color: #002cfa;
      color: #ffffff;
    `}
`;
export const Dot = styled.span`
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: #dfdfea;
`;

export const ThreeDotsWrapper = styled.div`
  display: flex;
  grid-column-gap: 3px;
`;

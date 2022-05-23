import styled, {css} from 'styled-components';

const disabledOpacity = 0.4;

type CheckboxWrapperProps = {
  disabled?: boolean;
};

export const CheckboxWrapper = styled.div<CheckboxWrapperProps>`
  font-family: ProximaNova-Light, sans-serif;
  cursor: pointer;
  font-size: 14px;
  text-align: left;
  min-width: auto;
  display: flex;
  color: #161643;
  align-items: center;

  ${(props) =>
    props.disabled &&
    css`
      opacity: ${disabledOpacity};
      cursor: not-allowed;
    `};
`;

export const AcceptIconImg = styled.img`
  user-select: none;
  width: 22px;
  height: 18px;
  margin-top: 1px;
`;

type BoxProps = {
  disabled?: boolean;
  checked?: boolean;
};

export const Box = styled.div<BoxProps>`
  width: 24px;
  height: 24px;
  box-sizing: border-box;
  margin-right: 9px;
  border: 1px solid #f4f6f8;
  text-align: center;
  transition: all 0.1s ease-in-out;
  background-color: #f4f6f8;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  opacity: ${(props) => props.disabled && disabledOpacity};

  ${(props) =>
    props.checked &&
    css`
      background-color: #ffffff;
      border-color: #2148ff;
    `};
`;

export const Label = styled.span`
  user-select: none;
  vertical-align: middle;
  font-family: ProximaNova-Medium, sans-serif;
  color: #161643;
  font-size: 16px;
`;

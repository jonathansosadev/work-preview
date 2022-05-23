import styled, {css} from 'styled-components';

type StyledButtonProps = {
  active?: boolean;
  disabled?: boolean;
};

export const StyledButton = styled.label<StyledButtonProps>`
  background-color: #f2f2fa;
  min-width: 117px;
  border-radius: 6px;
  outline: none;
  border: 1px solid #e7ebef;
  cursor: pointer;
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 15px;
  color: #9696b9;
  text-align: left;
  padding: 11px 16px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  user-select: none;
  transition: all 0.07s ease-in-out;

  & input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }

  ${(props) =>
    props.disabled &&
    css`
      opacity: 0.3;
      cursor: not-allowed;
    `};

  ${(props) =>
    !props.disabled &&
    css`
      &:hover {
        border-color: #2148ff;
      }

      &:active {
        opacity: 1;
      }
    `};

  ${(props) =>
    props.active &&
    css`
      background-color: #ffffff;
      border-color: #2148ff;
      color: #161643;
    `};
`;

export const Content = styled.div`
  height: 100%;
`;

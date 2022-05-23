import styled, {css} from 'styled-components';

type RadioWrapperProps = {
  disabled?: boolean;
};

export const RadioWrapper = styled.div<RadioWrapperProps>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  grid-gap: 10px;

  ${(props) =>
    props.disabled &&
    css`
      opacity: 0.4;
      cursor: not-allowed;
    `};
`;

export const RadioOption = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

export const RadioInput = styled.input`
  outline: none;
  user-select: none;
  position: absolute;
  z-index: -1;
  opacity: 0;
`;

export const RadioLabel = styled.label`
  display: flex;
  font-family: ProximaNova-Light, sans-serif;
  font-size: 16px;
  user-select: none;
  vertical-align: middle;
  cursor: pointer;
  color: #161643;

  ${RadioInput} + &::before {
    content: '';
    display: inline-block;
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    flex-grow: 0;
    border: 1px solid #9696b9;
    border-radius: 50%;
    margin-right: 0.5em;
    background-repeat: no-repeat;
    background-position: center center;
    background-color: #e7ebef;
    background-size: 50% 50%;
    box-sizing: border-box;
    transition: background-color 0.1s ease-in-out;
    outline: none;
  }

  ${RadioInput}:not(:disabled):not(:checked) + &:hover::before {
    background: #fff;
  }

  ${RadioInput}:not(:disabled):active + &::before {
    background-color: #b3d7ff;
    border-color: #b3d7ff;
  }

  ${RadioInput}:focus + &::before {
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }

  ${RadioInput}:focus:not(:checked) + &::before {
    border-color: #80bdff;
  }

  ${RadioInput}:checked + &::before {
    border: 2px solid #ffffff;
    background-color: #2148ff;
    padding: 2px;
    box-shadow: 0 0 0 1px #9696b9;
  }

  ${RadioInput}:disabled + &::before {
    background-color: #e9ecef;
  }
`;

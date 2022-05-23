import styled, {css} from 'styled-components';

export const IconButtonStyled = styled.button`
  border: 1px solid rgb(229, 230, 238);
  background-color: white;
  cursor: pointer;
  width: 30px;
  height: 30px;
  outline: none;
  border-radius: 2px;

  & > img {
    width: 12px;
    height: 16px;
    vertical-align: middle;
  }

  &:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 1;
  }

  ${(props) =>
    props.disabled &&
    css`
      opacity: 0.3;
      pointer-events: none;
    `};
`;

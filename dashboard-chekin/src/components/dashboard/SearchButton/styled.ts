import styled from 'styled-components';

export const Button = styled.button`
  outline: none;
  border: none;
  background-color: transparent;
  padding: 5px;
  cursor: pointer;

  & > img {
    position: relative;
    top: 2px;
  }

  &:active {
    opacity: 0.8;
  }
`;

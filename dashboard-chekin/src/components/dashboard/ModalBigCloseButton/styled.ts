import styled from 'styled-components';

export const CloseButton = styled.button`
  position: absolute;
  right: 19px;
  top: 16px;
  width: 36px;
  height: 38px;
  box-shadow: 0 10px 10px #2148ff1a;
  border-radius: 6px;
  text-align: center;
  outline: none;
  padding: 0;
  border: none;
  background-color: white;
  cursor: pointer;

  &:hover {
    opacity: 0.7;
  }

  &:active {
    opacity: 1;
  }

  & > img {
    height: 15px;
    vertical-align: middle;
  }
`;

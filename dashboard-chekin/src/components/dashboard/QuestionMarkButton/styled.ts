import styled from 'styled-components';

export const MRZModalTrigger = styled.button`
  height: 22px;
  width: 22px;
  outline: none;
  border-radius: 100%;
  border: none;
  box-shadow: 0 10px 10px #2148ff1a;
  cursor: pointer;
  user-select: none;
  vertical-align: middle;
  background-color: white;

  &:hover {
    opacity: 0.8;
  }

  & > img {
    height: 16px;
    width: 8px;
  }

  &:active {
    opacity: 0.9;
  }
`;

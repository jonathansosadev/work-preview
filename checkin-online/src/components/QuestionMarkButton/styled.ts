import styled from 'styled-components';

export const MRZModalTrigger = styled.button`
  width: 34px;
  height: 34px;
  outline: none;
  border-radius: 100%;
  border: none;
  box-shadow: 0 10px 10px #2699fb1a;
  cursor: pointer;
  user-select: none;
  vertical-align: middle;
  background-color: white;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 1;
  }

  & > img {
    width: 13px;
    height: 21px;
  }
`;

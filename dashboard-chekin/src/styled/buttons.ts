import styled from 'styled-components';
import removeIcon from '../assets/remove.svg';

export const RemoveButton = styled.button`
  width: 23px;
  height: 23px;
  padding: 0;
  background: transparent url(${removeIcon}) center/100% no-repeat;
  border-radius: 3px;
  transition: box-shadow 0.15s ease-in-out 0s;

  &:hover {
    box-shadow: rgba(15, 71, 119, 0.204) 0px 3px 3px;
  }

  &:active {
    opacity: 0.95;
  }
`;

export const IconButton = styled.button`
  height: 20px;
  width: 20px;
  padding: 5px;
  outline: none;
  border: none;
  background-color: transparent;
  box-sizing: content-box;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 1;
  }
`;

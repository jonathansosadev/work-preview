import styled from 'styled-components';

export const ContactSupportButton = styled.button`
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 16px;
  color: #385cf8;
  outline: none;
  border: none;
  background-color: white;
  cursor: pointer;
  text-transform: lowercase;
  padding: 0 0 0 5px;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 1;
  }
`;

export const FinishModalButtonWrapper = styled.div`
  padding-bottom: 76px;
`;

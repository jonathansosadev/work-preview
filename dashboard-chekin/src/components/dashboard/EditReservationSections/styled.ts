import styled from 'styled-components';
import ModalButton from '../ModalButton';

export const Wrapper = styled.div``;

export const ButtonLabelWrapper = styled.div`
  display: flex;
  align-items: center;
`;

export const ButtonLabelIcon = styled.img`
  height: 12px;
  width: 12px;
  margin-right: 10px;
  margin-left: 2px;
`;

export const ButtonLabelText = styled.div`
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 12px;
  color: #ffffff;
  text-transform: uppercase;
`;

export const DeleteButtonWrapper = styled.div`
  margin-top: 43px;
`;

export const DeleteModalButton = styled(ModalButton)`
  border-color: #9696b9;
`;

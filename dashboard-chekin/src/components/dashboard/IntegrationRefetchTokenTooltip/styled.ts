import styled from 'styled-components';
import ModalButton from '../../dashboard/ModalButton';

export const Container = styled.div`
  position: fixed;
  box-shadow: 0 5px 5px #2148ff1a;
  width: 200px;
  bottom: 16px;
  left: 16px;
  background-color: white;
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 14px;
  padding: 15px;
  border-radius: 6px;
  z-index: 9999;
  cursor: default;
  animation: appear 0.7s ease-in;

  @keyframes appear {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

export const Title = styled.div`
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 16px;
  margin-bottom: 4px;
`;

export const ButtonContainer = styled.div`
  text-align: right;
  margin-top: 10px;
`;

export const Button = styled(ModalButton)`
  min-width: auto;
  min-height: auto;
  font-size: 14px;
  height: auto;
  padding: 5px 10px;
`;

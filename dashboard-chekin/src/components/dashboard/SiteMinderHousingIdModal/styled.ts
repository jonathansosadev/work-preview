import styled from 'styled-components';
import ModalButton from '../ModalButton';
import {ModalTwoButtonsWrapper} from '../../../styled/common';

export const AvailabilityContainer = styled.div`
  max-width: 337px;
  padding: 0 29px 60px;
  box-sizing: border-box;
`;

export const PropertyId = styled.div`
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 16px;
  margin-top: 20px;
  text-align: center;
`;

export const Title = styled.div`
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 18px;
`;

export const Subtitle = styled.h3`
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 16px;
  margin: 0;
`;

export const Content = styled.div`
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 16px;
  text-align: center;
`;

export const Text = styled.p`
  margin: 20px 0 10px;
`;

export const ButtonWrapper = styled(ModalTwoButtonsWrapper)`
  margin: 0;
  height: auto;
`;

export const ModalButtonUnderstood = styled(ModalButton)`
  width: 211px;
  height: 56px;
`;

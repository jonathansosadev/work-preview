import styled from 'styled-components';
import ModalButton from '../ModalButton';

export const AvailabilityContainer = styled.div`
  max-width: 600px;
  padding: 40px 50px 40px;
`;

export const TitleImage = styled.img`
  width: 150px;
  height: 34px;
  margin: 0 0 40px;
`;

export const Subtitle = styled.h3`
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 16px;
  margin: 0;
`;

export const Content = styled.div`
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 16px;
  text-align: left;
  margin-top: 25px;
`;

export const ButtonWrapper = styled.div`
  margin-top: 40px;
`;

export const ModalButtonStyled = styled(ModalButton)`
  width: 211px;
  height: 48px;
`;

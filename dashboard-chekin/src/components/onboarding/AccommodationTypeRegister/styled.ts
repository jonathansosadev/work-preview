import styled, {css} from 'styled-components';
import {DEVICE} from '../../../styled/device';

type ActiveProps = {
  active?: boolean;
};

export const TitleWrapper = styled.div`
  margin-bottom: 87px;
  margin-top: 40px;
`;

export const ButtonsWrapper = styled.div`
  display: flex;
  margin-top: 70px;
  flex-direction: column;
  align-items: center;
  z-index: 2;

  & :first-child {
    margin-bottom: 20px;
  }
`;

export const AccommodationTypesWrapper = styled.div`
  display: flex;
  max-width: 528px;
  flex-wrap: wrap;
  margin: 0 auto;
  justify-content: space-between;

  @media (max-width: ${DEVICE.tablet}) {
    flex-direction: column;
    align-items: center;
    height: 550px;
  }
`;

export const AccommodationTypeTile = styled.div<ActiveProps>`
  width: 235px;
  height: 155px;
  user-select: none;
  border-radius: 3px;
  text-align: center;
  box-sizing: border-box;
  cursor: pointer;
  background-color: white;
  transition: box-shadow 0.08s ease-in-out;
  box-shadow: 0 15px 15px 0
    ${(props) => (props.active ? 'transparent' : 'rgba(38, 153, 251, 0.1)')};
  border: solid ${(props) => (props.active ? `2px #161643` : '1px #2960F5')};

  &:hover {
    ${(props) =>
      !props.active &&
      css`
        box-shadow: none;
        opacity: 0.85;
      `}
  }
`;

export const VacationRentalLogo = styled.img<ActiveProps>`
  height: 48px;
  width: 48px;
  margin: ${(props) => (props.active ? '27px' : '28px')} auto 18px;
`;

export const HotelRentalLogo = styled.img<ActiveProps>`
  height: 44px;
  width: 55px;
  margin: ${(props) => (props.active ? '29px' : '30px')} auto 20px;
`;

export const AccommodationTypeTileTitle = styled.div<ActiveProps>`
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 19px;
  line-height: 1.18;
  text-align: center;
  color: ${(props) => (props.active ? '#161643' : '#2960F5')};
`;

export const Illustration = styled.img`
  position: absolute;
  width: 460px;
  height: 415px;
  right: 51px;
  top: 286px;
  z-index: 1;
  user-select: none;

  @media (max-width: ${DEVICE.tablet}) {
    display: none;
  }
`;

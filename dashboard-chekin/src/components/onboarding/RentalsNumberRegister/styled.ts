import styled, {css} from 'styled-components';
import {DEVICE} from '../../../styled/device';

export const TitleWrapper = styled.div`
  margin: 40px auto 58px;
`;

export const ButtonsWrapper = styled.div`
  display: flex;
  margin-top: 32px;
  flex-direction: column;
  align-items: center;
  z-index: 2;

  & :first-child {
    margin-bottom: 20px;
  }
`;

type RentalsNumberTileProps = {
  active?: boolean;
};

export const RentalsNumberTile = styled.div<RentalsNumberTileProps>`
  width: 145px;
  height: 102px;
  border-radius: 3px;
  box-sizing: border-box;
  text-align: center;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 19px;
  font-weight: 500;
  margin-bottom: 24px;
  user-select: none;
  cursor: pointer;
  background-color: white;
  transition: box-shadow 0.08s ease-in-out;
  box-shadow: 0 30px 30px ${(props) => (props.active ? 'transparent' : '#2148ff1a')};
  line-height: ${(props) => (props.active ? '100px' : '102px')};
  color: ${(props) => (props.active ? '#161643' : '#2960F5')};
  border: solid ${(props) => (props.active ? `2px #161643` : '1px #2960F5')};

  &:hover {
    ${(props) =>
      !props.active &&
      css`
        box-shadow: none;
        opacity: 0.9;
      `}
  }
`;

export const RentalsNumberWrapper = styled.div`
  margin: -10px auto auto;
  max-width: 314px;
  display: flex;
  flex-wrap: wrap;

  & :nth-child(even) {
    margin-left: 24px;
  }

  @media (max-width: 335px) {
    flex-direction: column;
    align-items: center;
    justify-content: center;

    & :nth-child(even) {
      margin-left: 0;
    }
  }
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

export const LowercaseWrapper = styled.span`
  text-transform: lowercase;
`;

import styled, {css} from 'styled-components';
import {DEVICE} from '../../../styled/device';

export const TitleWrapper = styled.div`
  margin: 40px auto 50px;
`;

export const ButtonsWrapper = styled.div`
  display: flex;
  margin-top: 20px;
  flex-direction: column;
  align-items: center;
  z-index: 2;

  & :first-child {
    margin-bottom: 20px;
  }
`;

export const FieldWrapper = styled.div`
  margin-bottom: 24px;
  padding: 0 10px;
`;

type PressingTileProps = {
  active?: boolean;
};

export const PressingTile = styled.div<PressingTileProps>`
  max-width: 471px;
  height: 87px;
  margin: auto;
  border-radius: 3px;
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 26px;
  text-align: center;
  box-sizing: border-box;
  user-select: none;
  cursor: pointer;
  background-color: white;
  box-shadow: 0 15px 15px 0
    ${(props) => (props.active ? 'transparent' : 'rgba(38, 153, 251, 0.1)')};
  line-height: ${(props) => (props.active ? '85px' : '87px')};
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

import styled, {css} from 'styled-components';
import Button from '../Button';
import {Link} from 'react-router-dom';
import {DEVICE} from '../../../styled/device';

export const Tile = styled.div`
  box-sizing: border-box;
  padding: 20px 20px 45px;
  width: 294px;
  margin: 58px auto;
  min-height: 444px;
  border-radius: 8px;
  box-shadow: 0 15px 15px 0 rgba(38, 153, 251, 0.1);
  background-color: white;

  @media (max-width: ${DEVICE.mobileL}) {
    box-shadow: none;
    width: 85%;
    margin-top: 75px;
  }
`;

export const PromptText = styled.div`
  font-family: ProximaNova-Light, sans-serif;
  font-size: 13px;
  color: #161643;
  margin: 30px 0 40px;
  text-align: center;

  @media (max-width: ${DEVICE.mobileL}) {
    font-size: 15px;
    text-align: left !important;
  }
`;

export const SuccessSentText = styled.div`
  font-family: ProximaNova-Light, sans-serif;
  font-size: 18px;
  color: #161643;
  margin: 30px 0 50px;
  text-align: center;
`;

export const BackToLoginWrapper = styled.div`
  & button {
    font-size: 14px;
  }
`;

export const FieldsWrapper = styled.div`
  margin-bottom: 40px;
`;

export const TileTitle = styled.div`
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 23px;
  font-weight: 500;
  text-align: left;
  color: #161643;
`;

export const BackLink = styled(Link)`
  position: absolute;
  left: 35px;
  top: -30px;
  font-size: 12px;
  color: #161643;
  font-family: ProximaNova-Medium, sans-serif;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    opacity: 1;
  }

  @media (max-width: ${DEVICE.mobileL}) {
    font-size: 14px;
  }
`;

type SubmitButtonProps = {
  visible: boolean;
};

export const SubmitButton = styled(Button)<SubmitButtonProps>`
  ${(props) =>
    !props.visible &&
    css`
      &,
      &:hover,
      &:active {
        opacity: 0;
        cursor: default;
      }
    `}

  @media (max-width: ${DEVICE.mobileL}) {
    min-width: 240px;
    font-size: 14px;
  }
`;

export const ArrowImg = styled.img`
  width: 20px;
  height: 20px;
  margin-right: 8px;
  vertical-align: middle;
  position: relative;
  top: -1px;
`;

import styled from 'styled-components';
import {device} from '../../styled/device';
import {StyledButton} from '../Button/styled';

export const Content = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  cursor: default;

  & ${StyledButton} {
    width: 320px;

    @media (max-width: ${device.tablet}) {
      width: 300px;
    }
  }
`;

const Text = styled.div`
  text-align: center;
  font-family: ProximaNova-Light, sans-serif;
  color: #161643;
  font-size: 19px;
  max-width: 315px;

  & > b {
    font-family: ProximaNova-Bold, sans-serif;
  }
`;

export const Title = styled(Text)`
  margin: 56px auto 54px;

  @media (max-width: ${device.tablet}) {
    margin-top: 40px;
  }
`;

export const OrText = styled(Text)`
  margin-bottom: 20px;
`;

export const CameraIcon = styled.img`
  margin-top: 4px;
`;

export const ContractIcon = styled.img`
  margin-top: 6px;
`;

export const EyeIconContainer = styled.span`
  box-shadow: 0 16px 16px #2699fb29;
  border-radius: 100%;
  background-color: white;
  width: 34px;
  height: 34px;
  line-height: 34px;
  text-align: center;

  & > img {
    vertical-align: middle;
    width: 21px;
    height: 13px;
  }
`;

export const ModalTrigger = styled.button`
  cursor: pointer;
  user-select: none;
  display: inline-flex;
  align-items: center;
  color: #1a8cff;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 18px;
  max-width: 320px;
  margin: 23px auto 54px;
  outline: none;
  border: none;
  background-color: transparent;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 1;
  }

  & > ${EyeIconContainer} {
    margin-right: 10px;
  }
`;

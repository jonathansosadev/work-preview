import styled from 'styled-components';
import {device} from '../../styled/device';

export const Wrapper = styled.div`
  display: inline-flex;
  flex-direction: column;
`;

export const SignatureTitle = styled.div`
  margin-top: 30px;
  text-align: left;
  margin-bottom: 10px;
  font-size: 16px;
  font-family: ProximaNova-Regular, sans-serif;
  color: #161643;
  text-transform: capitalize;
`;

export const SignatureWrapper = styled.div`
  display: inline-flex;
  width: 327px;
  height: 200px;
  border: 2px solid #1a8cff;
  box-sizing: border-box;
  justify-content: center;
  cursor: pointer;
  border-radius: 28px;

  @media (max-width: ${device.mobileS}) {
    width: 302px;
    overflow: hidden;
  }
`;

export const SignaturePlaceholder = styled(SignatureWrapper)`
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
  background-color: #f4f6f8;
`;

export const SignatureIcon = styled.img`
  width: 59px;
  height: 66px;
  opacity: 0.55;
  user-select: none;
`;

export const SignatureText = styled.div`
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 18px;
  margin: 2px 0 0;
  color: #ffffff;
  background: transparent linear-gradient(318deg, #8181a3 0%, #9696b9 100%) 0% 0%
    no-repeat padding-box;
  box-shadow: 0 3px 4px #00020333;
  padding: 9px 25px;
  border-radius: 6px;
  user-select: none;
  text-align: left;
`;

type ClearButtonWrapperProps = {
  visible?: boolean;
};

export const ClearButtonWrapper = styled.div<ClearButtonWrapperProps>`
  text-align: center;
  visibility: ${props => !props.visible && 'hidden'};
`;

export const ClearButton = styled.button`
  min-width: 91px;
  height: 35px;
  border: 0;
  outline: none;
  background: transparent linear-gradient(162deg, #385cf8 0%, #2148ff 100%) 0 0 no-repeat
    padding-box;
  box-shadow: 0 3px 4px #00020333;
  border-radius: 6px;
  margin-top: 11px;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 14px;
  text-transform: capitalize;
  color: white;
  cursor: pointer;
  user-select: none;
  padding: 7px 15px;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    opacity: 1;
  }
`;

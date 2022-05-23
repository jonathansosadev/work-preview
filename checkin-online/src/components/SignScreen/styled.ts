import styled from 'styled-components';
import SignatureCanvas from '../SignatureCanvas';
import {device} from '../../styled/device';

export const Wrapper = styled.div`
  text-align: center;

  @media (max-width: ${device.tablet}) {
    margin-bottom: 100px;
  }
`;

export const TopText = styled.div`
  text-align: center;
  max-width: 319px;
  margin: 42px auto 15px;
  font-family: ProximaNova-Light, sans-serif;
  font-size: 18px;
  color: #161643;
  user-select: none;
`;

export const Text = styled(TopText)`
  margin-top: 0;
`;

export const StyledSignatureCanvas = styled(SignatureCanvas)`
  margin-top: 22px;
  margin-bottom: 26px;
`;

export const CheckboxWrapper = styled.div`
  max-width: 319px;
  margin: 0 auto 16px;

  @media (max-width: ${device.mobileS}) {
    max-width: unset;
    margin-left: 10px;
  }
`;

export const TermsLink = styled.a`
  color: #385cf8;
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 18px;
  text-decoration: none;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    opacity: 1;
  }
`;

export const SubmitButtonWrapper = styled.div`
  margin: 38px 0 50px;
  display: flex;
  justify-content: center;
`;

export const RetryButton = styled.button`
  min-width: 91px;
  height: 35px;
  border: 0;
  outline: none;
  background-color: #2194f7;
  box-shadow: 0 11px 11px #0c273e29;
  margin-top: 9px;
  border-radius: 2px;
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 14px;
  text-transform: uppercase;
  color: white;
  cursor: pointer;
  user-select: none;

  &:hover {
    opacity: 0.95;
  }

  &:active {
    opacity: 1;
  }
`;

export const ViewContractWrapper = styled.div`
  font-family: ProximaNova-Medium, sans-serif;
  color: black;
  font-size: 18px;
  max-width: 310px;
  margin: 40px auto 0;
  text-align: left;
  cursor: pointer;
  user-select: none;
  height: 35px;
  display: flex;
  align-items: center;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 1;
  }
`;

export const ViewContractIconContainer = styled.div`
  height: 40px;
  width: 40px;
  box-shadow: 0 16px 16px #2699fb29;
  border-radius: 6px;
  margin-right: 17px;
  display: inline-block;
  text-align: center;
  background: transparent linear-gradient(176deg, #385cf8 0%, #2148ff 100%) 0 0 no-repeat
    padding-box;

  > img {
    margin: 3px 0 0 2px;
  }
`;

export const ModalButtonWrapper = styled.div`
  text-align: center;
  margin-bottom: 52px;

  & > button {
    margin: auto;
  }
`;

export const SignModalButtonWrapper = styled(ModalButtonWrapper)`
  margin-top: -20px;
`;

export const AddYourSignatureText = styled.div`
  font-family: ProximaNova-Light, sans-serif;
  font-size: 20px;
  color: #161643;
  margin: 0 auto;
`;

import styled from 'styled-components';
import Button from '../Button';
import {device} from '../../styled/device';
import {contentStyle as baseContentStyle} from '../Modal/styled';
import {BaseButton} from '../../styled/common';

export const paymentModalContentStyle = {
  ...baseContentStyle,
  marginTop: 100,
};

export const Content = styled.main`
  display: flex;
  align-items: center;
  flex-direction: column;
  cursor: default;
`;

export const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 330px 1px 375px;
  column-gap: 80px;

  @media (max-width: 920px) {
    grid-template-columns: 375px;
    grid-template-rows: auto auto;
    row-gap: 40px;
  }

  @media (max-width: 420px) {
    grid-template-columns: 320px;
  }

  @media (max-width: 335px) {
    grid-template-columns: 285px;
    padding: 0 10px;
  }
`;

export const ResultColumn = styled.div``;

export const ResultWrapper = styled.div`
  margin-bottom: 20px;

  &::after {
    display: block;
    content: '';
    width: 295px;
    height: 1px;
    margin-top: 20px;
    background-color: #161643;
    opacity: 0.12;
  }

  &:last-child::after {
    content: none;
  }
`;

export const ResultTitle = styled.div`
  margin-bottom: 15px;
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 18px;
`;

export const ResultSubtitle = styled.div`
  margin-bottom: 15px;
  font-family: ProximaNova-Light, sans-serif;
  font-size: 18px;
`;

export const BoldSum = styled.span`
  font-family: ProximaNova-Semibold, sans-serif;
`;

export const TotalTitle = styled(BoldSum)`
  font-size: 18px;

  &::after {
    display: block;
    content: '';
    width: 290px;
    height: 1px;
    margin-top: 25px;
    background-color: #161643;
    opacity: 0.12;
  }
`;

export const Tip = styled.span`
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 15px;
`;

export const Divider = styled.div`
  width: 1px;
  height: 275px;
  margin-top: 10px;
  background-color: #161643;
  opacity: 0.12;

  @media (max-width: 920px) {
    display: none;
  }
`;

export const PaymentColumn = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Title = styled.header`
  margin-top: 30px;
  color: #161643;
  font-family: ProximaNova-Light, sans-serif;
  font-size: 18px;
  margin-bottom: 40px;
  text-align: center;
`;

export const Text = styled.div`
  color: #161643;
  font-family: ProximaNova-Light, sans-serif;
  font-size: 18px;
  margin-bottom: 14px;

  b {
    font-weight: normal;
    font-family: ProximaNova-Bold, sans-serif;
  }
`;

export const SubmitButtonWrapper = styled.div`
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const FormTitle = styled.div`
  margin-top: 20px;
  margin-bottom: 30px;
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 18px;
  color: #161643;
`;

export const CardholderNameInput = styled.input`
  width: 374px;
  height: 33px;
  border: none;
  border-bottom: 1px solid rgb(222 228 237);
  outline: none;
  font-family: sans-serif;
  font-size: 16px;
  color: #161643;
  padding: 0 10px 5px 0;
  box-sizing: border-box;
  margin: 5px auto 0;

  &::placeholder {
    color: rgb(45 80 142 / 34%);
  }

  @media (max-width: ${device.mobileM}) {
    width: 100%;
  }
`;

export const ExpiryDateInput = styled.input`
  border: none;
  width: 30px;
  height: 19px;
  font-family: sans-serif;
  font-size: 16px;
  color: #161643;
  outline: none;
  text-align: center;
  padding: 0;

  &::placeholder {
    color: rgb(45 80 142 / 34%);
  }
`;

export const ExpiryDatesWrapper = styled.div`
  margin-right: 25px;
  width: 100px;
  display: flex;
  padding-bottom: 6px;
  padding-top: 13px;
  border-bottom: 1px solid rgb(222 228 237);
  align-items: center;

  & > ${ExpiryDateInput}:first-child {
    text-align: left;
  }

  @media (max-width: ${device.mobileM}) {
    margin: 0;
  }
`;

export const Slash = styled.div`
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 18px;
  color: #161643;
  margin-right: 6px;
`;

export const FormError = styled.div`
  height: 30px;
  text-align: center;
  padding: 0 10px;
  color: #ff2467;
  line-height: 30px;
  margin-top: 5px;
`;

export const Main = styled.main`
  text-align: center;
  margin-top: 60px;
`;

export const FormField = styled.div`
  position: relative;
  margin-top: 20px;
  height: 58px;
`;

export const ExpirationDatesAndCVCFields = styled(FormField)`
  display: flex;
  width: 374px;
  margin-right: auto;
  margin-left: auto;
  align-items: flex-end;

  @media (max-width: ${device.mobileL}) {
    width: 100%;
  }
`;

export const FieldLabel = styled.label`
  font-family: ProximaNova-Regular, sans-serif;
  color: #1a8cff;
  font-size: 16px;
  text-align: left;
  display: inline-flex;
  justify-content: center;
  flex-direction: column;
`;

export const WideFieldLabel = styled(FieldLabel)`
  width: 100%;
`;

export const PaycometPan = styled.div`
  height: 27px;
  width: 374px;
  border-bottom: 1px solid rgb(222 228 237);
  padding-top: 10px;

  @media (max-width: ${device.mobileM}) {
    width: 100%;
  }
`;

export const PaycometCVC = styled.div`
  height: 27px;
  width: 70px;
  border-bottom: 1px solid rgb(222 228 237);
  padding-top: 12px;
`;

export const FieldOverlay = styled.div`
  position: absolute;
  left: 0;
  top: 20px;
  right: 0;
  bottom: 0;
  cursor: not-allowed;
  height: 30px;
  background-color: white;
`;

export const Footer = styled.footer`
  padding: 40px 0;
  text-align: center;
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 16px;
  color: rgb(173, 173, 204);
`;

export const Iframe = styled.iframe`
  width: 500px;
  height: 600px;
  border: none;
  margin-top: 35px;

  @media (max-width: ${device.tablet}) {
    width: 100%;
  }
`;

export const CloseIconButton = styled.button`
  width: 22px;
  height: 22px;
  outline: none;
  border: none;
  background-color: #1a8cff;
  border-radius: 50%;
  text-align: center;
  line-height: 22px;
  position: absolute;
  top: 5px;
  right: 0;
  cursor: pointer;
  user-select: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    opacity: 1;
  }
`;

export const SecureWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;

  & img {
    margin-right: 12px;
  }
`;

export const SecurePaymentText = styled.div`
  margin-top: 4px;
  font-family: ProximaNova-Light, sans-serif;
  font-size: 16px;
  color: #9696b9;
`;

export const PayButton = styled(Button)`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 190px;
  min-width: 190px;
  padding: 0;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 16px;
  text-transform: initial;
  background: linear-gradient(158deg, #385cf8 0%, #395bf8 100%);
  box-shadow: 0px 3px 4px #00020333;
  border-radius: 6px;

  opacity: ${props => (props.disabled ? 0.2 : 1)};

  &:hover {
    opacity: ${props => (props.disabled ? 0.2 : 1)};
  }

  .label {
    padding-left: 0;
    border-left: none;
  }
`;

export const CloseIcon = styled.img`
  width: 10px;
  height: 10px;
`;

export const SecondaryButton = styled(Button)`
  margin-top: 10px;
`;

export const RemovePriceItemButton = styled(BaseButton)`
  display: inline-flex;
  justify-content: center;
  align-items: center;
`;

export const DeleteDealIcon = styled.img`
  width: 13px;
  height: 13px;
  margin-left: 13px;
`;

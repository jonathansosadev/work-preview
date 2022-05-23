import styled, {css} from 'styled-components';
import {device} from '../../styled/device';
import Button from '../Button';
import {contentStyle as baseContentStyle} from '../Modal/styled';

export const paymentModalContentStyle = {
  ...baseContentStyle,
  marginTop: 100,
};

export const Content = styled.main`
  text-align: center;
  cursor: default;
`;

export const Title = styled.header`
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 16px;
  color: #161643;
  margin-top: 40px;
  padding: 0 10px;
`;

export const Text = styled.div`
  color: #161643;
  font-family: ProximaNova-Light, sans-serif;
  font-size: 18px;
  padding: 0 20px;
  margin: 0 auto;
  max-width: 1000px;
`;

type PaymentContentProps = {
  verticalLayout: boolean;
};

export const PaymentContent = styled.div<PaymentContentProps>`
  max-width: 375px;
  padding: 0 20px;
  margin: 30px auto 12px;
  text-align: left;
  display: grid;
  grid-template-columns: 380px 380px;
  grid-column-gap: 167px;
  grid-auto-flow: column;
  justify-content: center;

  ${props =>
    props.verticalLayout &&
    css`
      display: flex;
      flex-direction: column-reverse;
      align-items: center;
    `}
  
  @media (max-width: ${device.laptop}) {
    display: flex;
    flex-direction: column-reverse;
    align-items: center;
  }
`;

export const DepositAmountTitle = styled.div`
  font-family: ProximaNova-Semibold, sans-serif;
  color: #161643;
  font-size: 18px;
`;

export const DepositAmount = styled.div`
  font-family: ProximaNova-Light, sans-serif;
  font-size: 28px;
  color: #161643;
  margin-top: 5px;
  margin-bottom: 38px;
`;

export const BottomText = styled.div`
  margin-bottom: 40px;
  margin-top: 20px;
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
    width: 300px;
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

export const FieldOverlay = styled.div`
  position: absolute;
  left: 0;
  top: 20px;
  right: 0;
  bottom: 0;
  cursor: not-allowed;
  z-index: 9999;
  height: 30px;
  background-color: white;
`;

export const Main = styled.main`
  text-align: center;
  margin-top: 40px;
`;

export const LoaderWrapper = styled.div`
  padding-top: 60px;
`;

export const FormTitle = styled.div`
  color: #161643;
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 17px;
  margin-bottom: 25px;
  text-align: center;
`;

export const FormField = styled.div`
  text-align: center;
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

  @media (max-width: ${device.mobileM}) {
    width: 300px;
  }
`;

export const StripeCardElementFormField = styled(FormField)`
  margin-top: 50px;
  margin-bottom: 20px;
`;

export const ButtonsWrapper = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;

  & > :first-child {
    margin-bottom: 20px;
  }
`;

export const SecondaryButton = styled(Button)`
  margin-top: 10px;
`;

export const FieldLabel = styled.label`
  font-family: ProximaNova-Regular, sans-serif;
  color: #1a8cff;
  font-size: 16px;
  text-align: left;
  display: inline-flex;
  justify-content: center;
  flex-direction: column;
  height: 58px;
`;

export const PaycometPan = styled.div`
  height: 27px;
  width: 374px;
  border-bottom: 1px solid rgb(222 228 237);
  padding-top: 10px;

  @media (max-width: ${device.mobileM}) {
    width: 300px;
  }
`;

export const PaycometCVC = styled.div`
  height: 27px;
  width: 70px;
  border-bottom: 1px solid rgb(222 228 237);
  padding-top: 13px;
`;

export const PriceWrapper = styled.div`
  @media (max-width: ${device.laptop}) {
    text-align: center;
  }
`;

export const Footer = styled.footer`
  padding: 20px 0 40px;
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

export const CloseIcon = styled.img`
  width: 10px;
  height: 10px;
`;

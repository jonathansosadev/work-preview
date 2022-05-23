import styled from 'styled-components';
import {DEVICE} from '../../../styled/device';
import Button from '../Button';
import Input from '../Input';
import FormHeader from '../FormHeader';

export const Content = styled.div`
  max-width: 1047px;
  margin: 21px auto 0;
  cursor: default;
  padding: 0 120px 230px;
  text-align: center;
  position: relative;
`;

export const SubscriptionHeading = styled(FormHeader)`
  justify-content: center;
`;

export const SubHeader = styled.div`
  font-size: 18px;
  font-family: ProximaNova-Bold, sans-serif;
  color: #161643;
  margin-top: 49px;
  margin-bottom: 39px;
`;

export const Tip = styled.div`
  font-size: 16px;
  font-family: ProximaNova-Regular, sans-serif;
  color: #161643;
  margin-bottom: 54px;
`;

export const CardInfoWrapper = styled.div`
  margin: 18px auto 36px;
  width: 374px;
`;

export const ButtonWrapper = styled.div`
  margin: 0 auto 24px;
  text-align: center;
`;

export const stripeInputStyle = {
  base: {
    fontSize: '16px',
    color: '#33335A',
    fontFamily: 'SFProDisplay-Regular, sans-serif',
    letterSpacing: 'normal',

    '::placeholder': {
      color: '#B7C3D8',
    },
  },
  invalid: {
    color: '#ff5d8f',
  },
};

export const CardForm = styled.form`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

export const LoaderWrapper = styled.div`
  margin-top: 50px;
  text-align: center;
`;

export const CouponWrapper = styled.div`
  position: absolute;
  right: 0;
  top: 31px;
  padding: 17px 25px 39px;
  text-align: center;
  box-shadow: 0 7px 7px #2148ff1a;
  border: 1px solid #2194f7;
  border-radius: 3px;
  width: 151px;
  @media (max-width: ${DEVICE.laptopL}) {
    right: 20px;
  }
`;

export const CouponHeader = styled.div`
  font-size: 14px;
  font-family: ProximaNova-Light, sans-serif;
  color: #161643;
`;

export const CouponInputWrapper = styled.div`
  position: relative;
`;

export const CouponInput = styled(Input)`
  margin: 10px auto 0;
  width: 100px;
  input {
    font-family: ProximaNova-Medium, sans-serif;
    font-size: 14px;
    text-align: center;
    padding: 5px;
    &::placeholder {
      font-size: 14px;
      text-align: center;
    }
  }
`;

export const ResetCouponImg = styled.img`
  position: absolute;
  cursor: pointer;
  height: 20px;
  bottom: 5px;
  right: -10px;
`;

export const CouponButton = styled(Button)`
  min-width: 106px;
  height: 24px;
  margin: 26px auto 17px;
  div {
    height: auto;
    font-size: 14px;
    margin: 0 auto;
  }
`;

export const DotsWrapper = styled.div`
  width: 57px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
`;

export const Dot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #eeeeee;
`;

export const GreyText = styled.span`
  font-size: 14px;
  color: #9696b9;
  font-family: ProximaNova-Medium, sans-serif;
  text-transform: lowercase;
`;

export const BoldText = styled.span`
  font-size: 16px;
  color: #161643;
  font-family: ProximaNova-Medium, sans-serif;
`;

export const TextWrapper = styled.div`
  margin: 8px auto 20px;
`;

export const PriceValue = styled.div`
  margin-top: 21px;
  font-size: 31px;
  color: #161643;
  font-family: ProximaNova-Medium, sans-serif;
`;

export const CouponAppliedText = styled.div`
  margin-top: 22px;
  font-size: 16px;
  color: #161643;
  font-family: ProximaNova-Medium, sans-serif;
  position: relative;
`;

export const DiscountText = styled.div`
  margin-bottom: 17px;
  font-size: 13px;
  color: #161643;
  font-family: ProximaNova-Medium, sans-serif;
  position: relative;
`;

export const CheckImg = styled.img`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  left: 0;
`;

export const CouponHelper = styled.div`
  margin-bottom: 2px;
`;

export const ChangeCardWrapper = styled.div`
  margin-top: 20px;
  margin-bottom: 40px;
`;

export const CancelChangingWrapper = styled.div`
  margin-bottom: 40px;
  margin-top: -14px;
`;

export const IbanLabel = styled.div`
  margin: 0 0 10px 0;
  display: flex;
  justify-content: flex-start;
`;

export const ImportantInfo = styled.div`
  margin: 30px 0 0 0;
`;
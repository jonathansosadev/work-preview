import styled from 'styled-components';
import {Link} from 'react-router-dom';

export const PricingPopupTrigger = styled.span`
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 16px;
  color: #9696b9;
`;

export const PricingPopupTriggerWrapper = styled.div`
  display: block;
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 14px;
  user-select: none;
  cursor: pointer;
  margin-bottom: 20px;

  &:hover ${PricingPopupTrigger} {
    color: #385cf8;
  }

  &:active {
    opacity: 0.9;
  }
`;

export const PlanTypeText = styled.div`
  font-size: 16px;
  margin-bottom: 25px;
  font-family: ProximaNova-Regular, sans-serif;
  color: #161643;
`;
export const PlanTypeValue = styled.span`
  font-family: ProximaNova-Bold, sans-serif;
`;

export const PymentTitle = styled.span`
  font-family: ProximaNova-Bold, sans-serif;
`;

export const TextWrapper = styled.div`
  font-size: 16px;
  font-family: ProximaNova-Light, sans-serif;
  color: #161643;
  cursor: default;

  & > b {
    font-family: ProximaNova-Bold, sans-serif;
    font-weight: normal;
  }
`;

export const RegularText = styled.span`
  font-family: ProximaNova-Regular, sans-serif;
  display: inline-block;
`;

export const BoldUppercaseText = styled.span`
  font-family: ProximaNova-Bold, sans-serif;
  text-transform: uppercase;
`;

export const SubscribeLink = styled(Link)`
  font-family: ProximaNova-Semibold, sans-serif;
  color: #385cf8;
  text-decoration: none;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 1;
  }
`;

export const TrialsLeftTile = styled.div`
  margin: 25px 0 30px;
  box-shadow: 0 5px 5px #2148ff1a;
  border-radius: 6px;
  width: 177px;
  text-align: center;
  padding: 19px 0;
  cursor: default;
`;

export const TrialsLeftImg = styled.img`
  width: 29px;
  height: 30px;
`;
export const TrialsLeftCount = styled.div`
  font-family: ProximaNova-Bold, sans-serif;
  color: #161643;
  font-size: 41px;
  margin: 9px 0 2px;
  height: 50px;
`;
export const TrialsLeftMediumText = styled.div`
  font-family: ProximaNova-Medium, sans-serif;
  color: #161643;
  font-size: 16px;
  line-height: 20px;
`;
export const TrialsLeftLightText = styled.div`
  font-family: ProximaNova-Light, sans-serif;
  color: #161643;
  font-size: 16px;
  line-height: 20px;
  padding: 0 7px;
`;

export const ButtonLabelWrapper = styled.div`
  display: flex;
  align-items: center;
`;

export const ButtonLabelIcon = styled.img`
  width: 15px;
  height: 14px;
  margin-right: 11px;
`;

export const ButtonLabelText = styled.div`
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 15px;
  color: white;
  justify-content: center;
`;

export const FieldWrapper = styled.div`
  margin-bottom: 25px;
`;

export const ButtonsWrapper = styled.div`
  padding-top: 5px;
  display: flex;
  flex-wrap: wrap;

  & button {
    min-width: 138px;
  }

  & button:first-child {
    margin-right: 10px;
  }
`;

export const LoaderWrapper = styled.div`
  margin: 30px auto;
`;

export const PlanInfoContent = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-template-columns: 1fr 1fr 1fr;
`;

export const PlanInfoForm = styled.div`
  width: 327px;
  border-right: 1px solid #f1f1f4;
`;

export const PlanInfoPrice = styled.div`
  padding-left: 63px;
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 16px;
  cursor: default;

  & > b {
    font-family: ProximaNova-Bold, sans-serif;
    font-weight: normal;
  }
`;

export const SubscribeButtonLink = styled(Link)`
  text-decoration: none;
  display: inline-block;
`;

export const MarginTopWrapper = styled.div`
  margin-top: 30px;
`;

export const PaymentDetailsSection = styled.div`
  padding-top: 10px;
  margin-top: 10px;
  border-top: 1px solid rgb(246 247 250);
`;

export const PremiumServicesContainer = styled.div`
  border-right: 1px solid #f1f1f4;
  padding: 0 10px 0 10px;
`;

export const PremiumServicesHeader = styled.header`
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 16px;
  color: #161643;
  margin-bottom: 17px;
`;

export const BillingContainer = styled.div`
  padding: 0 10px 0 10px;
`;

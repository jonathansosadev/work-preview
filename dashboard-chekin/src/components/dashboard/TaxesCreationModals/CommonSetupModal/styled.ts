import styled from 'styled-components';
import BaseButton from '../../Button';
import Tooltip from '../../Tooltip';
import {Trigger, ContentWrapper} from '../../Tooltip/styled';

export const StepsNumber = styled.div`
  color: #161643;
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 33px;
  text-align: center;
  margin-top: 17px;
  display: inline-block;
  position: relative;
`;

export const Title = styled.header`
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 20px;
  color: #161643;
  margin-top: 22px;
  text-align: center;
`;

export const SubTitle = styled.div`
  color: #161643;
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 20px;
  max-width: 388px;
  margin: 53px auto 0;
`;

export const Button = styled(BaseButton)`
  min-width: 138px;

  & > div {
    margin: 0 auto;
  }
`;

export const ChoicesButtonsWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 39px;
  margin-bottom: 77px;

  & ${Button}:first-child {
    margin-right: 50px;
  }
`;

export const TransparentButton = styled.button`
  margin-bottom: 66px;
  border: none;
  background-color: transparent;
  color: #3499ff;
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 16px;
  outline: none;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 1;
  }
`;

export const BackButton = styled.button`
  outline: none;
  border: none;
  background-color: transparent;
  margin-right: 24px;
  padding: 0 5px;
  cursor: pointer;
  position: absolute;
  left: -45px;
  top: 0;
  bottom: 0;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 1;
  }

  & > img {
    height: 20px;
    width: 12px;
  }
`;

export const AgeExceptionsInputWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 30px;
`;

export const AgeExceptionsInputLabel = styled.label`
  font-family: ProximaNova-Medium, sans-serif;
  color: #161643;
  margin-right: 26px;
  align-self: flex-end;
  margin-bottom: 4px;
`;

export const AgeExceptionsButtonWrapper = styled.div`
  margin-top: 49px;

  & button {
    margin: 0 auto;
  }
`;

export const TitleTooltip = styled(Tooltip)`
  position: absolute;
  display: inline;
  margin-left: 20px;
  line-height: 1.3em;

  & ${Trigger} {
    color: #385cf8;
    font-family: ProximaNova-Semibold, sans-serif;
    font-size: 14px;
  }

  & ${ContentWrapper} {
    text-align: left;
  }
`;

export const MultiSelectWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 40px;
  margin-bottom: 30px;
`;

export const NextButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 41px;
`;

export const NumberOfNightsWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 35px;
  margin-bottom: 57px;
`;

export const FinishButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 99px;
`;

export const ShortInputWrapper = styled.div`
  display: flex;
`;

export const SeasonContainerShortInputWrapper = styled(ShortInputWrapper)`
  margin-top: 25px;
`;

export const ShortInputCurrency = styled.div`
  position: relative;
  top: 34px;
  font-family: ProximaNova-Medium, sans-serif;
  color: #161643;
  font-size: 24px;
  margin-left: 5px;
`;

export const PricePerNightInputWrapper = styled.div`
  margin-bottom: 67px;
  display: flex;
  justify-content: center;
`;

export const Text = styled.div`
  margin-top: 20px;
  margin-bottom: 30px;
  text-align: center;
  color: #161643;
  font-size: 17px;
  font-family: ProximaNova-Regular, sans-serif;
`;

export const PricePerNightSubTitle = styled(SubTitle)`
  margin-top: 15px;
`;

export const SeasonContainer = styled.div`
  width: 268px;
  box-shadow: 0 7px 7px #2148ff1a;
  border: 1px solid #161643;
  border-radius: 3px;
  padding: 34px 22px 45px 22px;
  display: flex;
  flex-direction: column;
  margin-top: 25px;
  box-sizing: border-box;
`;

export const WideSeasonContainer = styled(SeasonContainer)`
  width: 300px;
  padding: 34px 22px 25px 22px;
`;

export const SeasonsGroup = styled.div`
  display: flex;
  justify-content: center;
  margin: 0 99px 56px;
  text-align: left;

  & ${SeasonContainer}:first-child {
    margin-right: 38px;
  }
`;

export const SeasonLabel = styled.div`
  color: #161643;
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 16px;
  margin-bottom: 32px;
  text-align: left;
`;

export const AgeCalculatorWrapper = styled.div`
  margin-top: 13px;
  margin-bottom: 26px;
  text-align: left;
`;

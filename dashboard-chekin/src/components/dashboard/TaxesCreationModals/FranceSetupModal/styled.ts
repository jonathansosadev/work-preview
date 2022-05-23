import styled from 'styled-components';
import {DEVICE} from '../../../../styled/device';
import Tooltip from '../../Tooltip';
import Button from '../../Button';
import Stepper from '../../Stepper';
import {MultiRadio} from '../../Radio';

export const Wrapper = styled.div`
  min-width: 824px;
  height: 517px;

  @media (max-width: ${DEVICE.laptop}) {
    min-width: auto;
    height: auto;
  }
`;

export const SuccessStepWrapper = styled.div`
  padding-top: 118px;
`;

export const ClassificationStepWrapper = styled.div`
  padding-top: 8px;
`;

export const TaxesStepper = styled(Stepper)`
  margin: 0 auto;
  display: flex;
  justify-content: center;
`;

export const Title = styled.h1`
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 22px;
  padding: 10px 0;
  margin-bottom: 10px;
`;

export const Subtitle = styled.div`
  display: flex;
  margin: 50px auto 0;
  justify-content: center;
  grid-gap: 8px;

  @media (max-width: ${DEVICE.laptop}) {
    max-width: 546px;
    flex-wrap: wrap;
  }
`;

export const TooltipButton = styled.div`
  color: #002cfa;
  font-weight: 700;
`;

export const TooltipStyled = styled(Tooltip)`
  margin-left: 6px;
  position: relative;
  top: -1px;

  & a {
    font-family: ProximaNova-Bold, sans-serif;
    color: #2d53fb;
  }
`;

export const Link = styled.a`
  font-family: ProximaNova-Bold, sans-serif;
  color: #2d53fb;
`;

export const MultiRadioStyled = styled(MultiRadio)`
  margin: 0 auto;
  justify-content: center;
  grid-row-gap: 30px;

  & .radio_input {
    font-family: ProximaNova-Medium, sans-serif;
  }
`;

export const MultiRadioWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-top: 56px;
`;

export const FormWrapper = styled.div`
  display: flex;
  align-items: center;
  margin: 41px auto 0;
  max-width: 160px;
`;

export const ButtonsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 71px auto 40px;
  grid-row-gap: 28px;
`;

export const NextButton = styled(Button)`
  text-align: center;
  min-width: 211px;
  height: 48px;
  justify-content: center;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 16px;
`;

export const BackButton = styled(Button)`
  min-width: auto;
  height: auto;
  justify-content: center;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 16px;
`;

export const SuccessIcon = styled.img``;

export const SuccessTitle = styled.h1`
  font-weight: bold;
  font-size: 24px;
  margin: 5px 0 0;
`;

export const SuccessSubtitle = styled.p`
  font-size: 18px;
  margin: 12px;
`;

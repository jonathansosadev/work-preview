import styled from 'styled-components';
import Button from '../Button';
import FormHeader from '../FormHeader';
import {
  ModalTwoButtonsWrapper as BaseModalTwoButtonsWrapper,
} from '../../../styled/common';

export const Subtitle = styled.div`
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 16px;
  color: #6B6B95;
  margin-bottom: 30px;
  display: flex;
  justify-content: flex-start;
`;

export const SectionContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100%;
`;

export const RowInputs = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-direction: row;
  width: 646px
`;

export const RowFieldWrapper = styled.div`
  margin-bottom: 30px;
  margin-top: 30px;
`;

export const SubtitleModal = styled.div`
  font-family: ProximaNova-Medium, sans-serif;
  color: #161643;
  font-size: 18px;
  justify-content: center;
  align-items: center;
  width: 600px
  text-align: center;
`;

export const MaginTopSubtitle = styled.div`
  width: 600px;
  height: 25px;
`;

export const SendInvitationTwoButtonsWrapper = styled(BaseModalTwoButtonsWrapper)`
  margin-top: 19px;
`;

export const PropertiesButton = styled(Button)`
  font-size: 16px;
  font-family: ProximaNova-Bold, sans-serif;
  color: #2148FF
`;

export const IconContainer = styled.div`
  width: 21px;
  height: 21px;
  background-color: #2148FF;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 5px 0 0;
`;

export const SendButton = styled(Button)`
  width: 212px;
  height: 48px;
  dispaly: flex;
  justify-content: center;
  align-items: center;
`;

export const HeaderSection = styled(FormHeader)`
  margin-top: 0px;
`;

export const TooltipContentItem = styled.div`
  margin-bottom: 15px;
`;

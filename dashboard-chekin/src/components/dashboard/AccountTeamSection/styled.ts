import styled from 'styled-components';
import {Link} from 'react-router-dom';
import Button from '../Button';
import {
  ModalTwoButtonsWrapper as BaseModalTwoButtonsWrapper,
  MissingDataText,
} from '../../../styled/common';

export const Title = styled.header`
  font-family: ProximaNova-Semibold, sans-serif;
  color: #161643;
  font-size: 16px;
  margin-bottom: 25px;
`;

export const Subtitle = styled.div`
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 16px;
  color: #6B6B95;
  margin-bottom: 30px;
  display: flex;
  justify-content: flex-start;
`;

export const ModalContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 824px
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
`;

export const MaginTopSubtitle = styled.div`
  width: 600px;
  height: 25px;
`;


export const CollaboratorsLoaderWrapper = styled.div`
  max-width: 425px;
  height: 20px;
  display: flex;
  justify-content: flex-start;
  margin-bottom: 30px;
`;

export const CollaboratorsContainer = styled.div`
  display: grid;
  grid-template-columns: 0.95fr max-content 70px;
  grid-auto-rows: minmax(70px, auto);
  align-items: center;
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 35px;
  max-width: 425px;

  & > div:not(:nth-last-child(-n + 3)) {
    height: 100%;
    padding: 10px 0;
    box-sizing: border-box;
    border-bottom: 1px solid rgba(0, 66, 154, 0.09);
  }
`;

export const CollaboratorName = styled.div`
  font-family: ProximaNova-Regular, sans-serif;
  color: #161643;
  font-size: 15px;
  display: flex;
  align-items: center;
`;

export const CollaboratorEmailCell = styled.a`
  text-decoration: none;
  cursor: pointer;
  color: #9696b9;
  font-size: 13px;

  &:hover {
    text-decoration: underline;
  }
`;

export const CollaboratorType = styled(CollaboratorName)`
  font-family: ProximaNova-Bold, sans-serif;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  font-size: 16px;

  &&& {
    padding-right: 21px;
  }

  & > ${MissingDataText} {
    font-size: 16px;
    font-family: ProximaNova-Semibold, sans-serif;
  }
`;

export const ActionButtonsWrapper = styled.div`
  display: flex;
  align-items: center;

  & > button:last-child {
    margin-left: auto;
  }
`;

export const ActionButton = styled(Button)`
  min-width: auto;
  width: 30px;
  height: 30px;
  padding: 0;
  justify-content: center;

  & img {
    margin: 0;
  }
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

export const InviteButton = styled(Button)`
  width: 143px;
  height: 48px;
  dispaly: flex;
  justify-content: center;
  align-items: center;
`;

export const RouterLink = styled(Link)`
  display: flex;
  width: 190px;
  margin-top: 27px;
`;
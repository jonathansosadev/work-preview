import styled from 'styled-components';
import SendEmailBtn from '../SendEmailBtn';
import CopyLinkButton from '../CopyLinkButton';
import InitSection from '../Section';

export const Section = styled(InitSection)``;

export const Content = styled.div``;

export const FieldWrapper = styled.div`
  margin-bottom: 19px;
  display: flex;
  flex-direction: row;

  @media only screen and (max-width: 1235px) {
    flex-direction: column;
  }
`;

export const PanelWrapper = styled.div`
  display: flex;
  align-items: center;

  @media only screen and (max-width: 972px) {
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    margin-bottom: 20px;
  }
`;

export const SelectWrapper = styled.div`
  padding-left: 20px;

  @media only screen and (max-width: 1235px) {
    padding-left: 0;
    padding-top: 15px;
  }
`;

export const ShareOnlineCheckInContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-left: 20px;
  font-family: ProximaNova-Light, sans-serif;
  color: #161643;
  font-size: 13px;

  & > button {
    min-width: 171px;
    margin-top: 10px;
  }

  @media only screen and (max-width: 972px) {
    margin-left: 0;
  }
`;

export const SendCheckInOnlineButton = styled(SendEmailBtn)`
  width: 100%;
  margin-bottom: 10px;
`;

export const LoaderWrapper = styled.div`
  margin-top: 10px;
`;

export const SentEmailsContainer = styled.div`
  width: 177px;
  min-height: 118px;
  font-family: ProximaNova-Light, sans-serif;
  font-size: 13px;
  color: #161643;
  text-align: center;
  background-color: #ffffff;
  box-shadow: 0 5px 5px #2148ff1a;
  border-radius: 6px;
`;

export const SentEmailsTitle = styled.div`
  padding: 0 12px 12px;
`;

export const SentEmailsImage = styled.img`
  width: 31px;
  height: 36px;
  padding-bottom: 2px;
`;

export const SentEmailsNumber = styled.div`
  color: #161643;
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 31px;
  padding-bottom: 10px;
`;

export const ShareOnlineCheckinManuallyWrapper = styled.div`
  min-height: 118px;
  margin-left: 20px;
`;

export const ShareOnlineCheckinManuallyText = styled.div`
  margin-bottom: 10px;
`;

export const CopyButton = styled(CopyLinkButton)`
  width: 100%;
`;

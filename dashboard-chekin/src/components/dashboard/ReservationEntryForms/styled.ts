import styled from 'styled-components';
import {Heading} from '../../../styled/common';
import Button from '../Button';
import {
  DeleteGuestButton,
  ButtonLabelWrapper as BaseButtonLabelWrapper,
  ButtonsWrapper as BaseButtonsWrapper,
  DeleteButtonLabelIcon as BaseDeleteButtonLabelIcon,
  DeleteButtonLabelText as BaseDeleteButtonLabelText,
} from '../GuestInformationSection/styled';

export const Title = styled.div`
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 21px;
  color: #161643;
  margin-bottom: 4px;
`;

export const Subtitle = styled(Title)`
  text-align: center;
  font-size: 16px;
  margin-bottom: 5px;
`;

export const SubSubtitle = styled(Title)`
  text-align: center;
  font-size: 14px;
  margin-bottom: 0;
`;

export const DownloadAllButton = styled(Button)`
  min-width: 171px;
`;

export const GuestsWrapper = styled.div`
  margin-top: 48px;
`;

export const GuestsTitle = styled.div`
  font-family: ProximaNova-Bold, sans-serif;
  color: #161643;
  font-size: 18px;
  margin-bottom: 30px;
`;

export const MissingGuestsText = styled(GuestsTitle)`
  text-align: center;
  font-size: 25px;
  color: #9696b9;
  padding-top: 30px;
  opacity: 0.6;
`;

export const Cell = styled.div`
  width: 100%;
  padding-right: 18%;
  box-sizing: border-box;
  height: 100%;
  display: flex;
  align-items: center;
  overflow-y: auto;
`;

type BottomButtonWrapperProps = {
  shifted?: boolean;
};

export const BottomButtonWrapper = styled.div<BottomButtonWrapperProps>`
  height: 89px;
  display: flex;
  align-items: flex-end;
  background-color: #fdfdff;
  z-index: 1;
  position: relative;
  margin-top: ${(props) => (props.shifted ? '-25px' : '-10px')};
`;

export const Layout = styled.div`
  display: grid;
  width: 100%;
  grid-template-columns: 1fr 1fr 0.695fr;
  grid-auto-flow: row;

  & > div {
    overflow-x: hidden;
    display: flex;
    align-items: center;
    height: 72px;
    margin-right: 15%;
    border-right: 1px solid rgba(0, 66, 154, 0.09);
    flex-direction: column;
    justify-content: center;
    position: relative;

    &:after {
      content: '';
      box-sizing: border-box;
      width: 82%;
      border-bottom: 1px solid rgba(0, 66, 154, 0.09);
      position: absolute;
      left: 0;
      bottom: 0;
    }

    &:nth-child(-n + 3) {
      height: 47px;

      & > ${Cell} {
        align-items: flex-start;
      }
    }

    &:nth-child(3n) {
      margin-right: 0;
      border-right: none;

      &:after {
        margin-right: 0;
        width: 100%;
      }

      & > ${Cell} {
        padding-right: 0;
      }
    }
  }
`;

export const GuestName = styled.div`
  padding-right: 10px;
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 16px;
  color: #161643;
  position: relative;
  z-index: 5;
  max-height: 100%;
`;

export const LoaderWrapper = styled.div`
  display: flex;
  padding-top: 15%;
  justify-content: center;
`;

export const EntryFormsHeader = styled(Heading)`
  align-items: flex-start;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 21px;
`;

export const DeleteEntryFormButton = styled(DeleteGuestButton)`
  margin-left: 13px;
  width: 21px;
  height: 22px;
  padding: 0;
  text-align: center;

  & > img {
    position: relative;
    top: -1px;
    left: 0px;
    width: 12px;
    height: 12px;
  }
`;

export const ButtonLabelWrapper = styled(BaseButtonLabelWrapper)``;

export const ButtonsWrapper = styled(BaseButtonsWrapper)``;

export const DeleteButtonLabelIcon = styled(BaseDeleteButtonLabelIcon)``;

export const DeleteButtonLabelText = styled(BaseDeleteButtonLabelText)``;

export const RowErrorIcon = styled.img`
  margin-left: 3px;
  height: 11px;
`;

import styled, {css} from 'styled-components';
import Webcam from '../Webcam';
import {ErrorMessage, FieldsGridLayout} from '../../../styled/common';
import {baseContentStyle} from '../Modal';

export const scanModalContentStyle = {
  ...baseContentStyle,
  minHeight: 363,
};

export const viewDocumentsModalContentStyle = {
  ...baseContentStyle,
  minHeight: 'auto',
};

export const ButtonLabelWrapper = styled.div`
  display: flex;
  align-items: center;
`;

export const ButtonLabelIcon = styled.img`
  height: 12px;
  width: 12px;
  margin-right: 10px;
  margin-left: 2px;
`;

export const ButtonLabelText = styled.div`
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 12px;
  color: #ffffff;
  text-transform: uppercase;
`;

export const MissingNameTitle = styled.span`
  color: #adadcc;
`;

export const FieldsContainer = styled(FieldsGridLayout)`
  padding: 40px 0;
`;

export const Form = styled.form``;

export const FormContent = styled.div`
  border-bottom: 1px solid #ecf1f7;
`;

export const SignaturePlaceholder = styled.div`
  width: 132px;
  height: 101px;
  margin-top: 17px;
`;

export const ScanModalButtonsWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  margin-bottom: 30px;
  margin-top: 28px;

  & button:first-child {
    margin-bottom: 15px;
  }
`;

export const UploadModalButtonsWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  margin-bottom: 38px;
  margin-top: 22px;
`;

export const ModalContent = styled.div`
  position: relative;
  text-align: center;
`;

export const ModalCloseButton = styled.button`
  outline: none;
  border: none;
  cursor: pointer;
  top: 8px;
  right: 8px;
  background-color: transparent;
  position: absolute;

  & > img {
    transition: box-shadow 0.15s ease-in-out;
    margin-right: 8px;
    border-radius: 3px;
  }

  &:hover > img {
    box-shadow: 0 3px 3px #0f477734;
  }

  &:active {
    opacity: 0.9;
  }
`;

export const ModalTitle = styled.div`
  font-family: ProximaNova-Light, sans-serif;
  color: #161643;
  font-size: 16px;
  margin: 54px auto 21px;
  max-width: 283px;

  & > b {
    font-weight: normal;
    font-family: ProximaNova-Semibold, sans-serif;
    color: #9696b9;
  }
`;

export const ScanModalHint = styled.div`
  font-family: ProximaNova-Light, sans-serif;
  font-size: 14px;
  color: #161643;
  padding: 0 40px;
  margin-bottom: 9px;
`;

export const ScanModalTriggerButtonWrapper = styled.div`
  margin-top: 40px;
`;

export const AddDataManuallyText = styled.div`
  margin-top: 35px;
  margin-bottom: -5px;
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 16px;
  color: #161643;
`;

type DetectionWebcamProps = {
  isMobile: boolean;
};

export const DetectionWebcam = styled(Webcam)<DetectionWebcamProps>`
  & video {
    transform: ${(props) => props.isMobile && 'rotateY(180deg)'} scaleX(-1) !important;
  }
`;

export const AbortRequestButtonWrapper = styled.div`
  margin-top: 73px;
  margin-bottom: 15px;
`;

export const PlusImage = styled.img`
  width: 20px;
  height: 20px;
  margin-right: 8px;
  transition: box-shadow 0.15s ease-in-out;
  border-radius: 3px;
`;

type AddBtnWrapperProps = {
  disabled?: boolean;
};

export const BottomButton = styled.button<AddBtnWrapperProps>`
  display: flex;
  align-items: center;
  margin-bottom: 14px;
  cursor: pointer;
  outline: none;
  border: none;
  background-color: transparent;
  padding: 0;

  ${(props) =>
    props.disabled &&
    css`
      cursor: not-allowed;
      opacity: 0.3;
    `};

  ${(props) =>
    !props.disabled &&
    css`
      &:hover > ${PlusImage} {
        box-shadow: 0 3px 3px #0f477734;
      }

      &:active > ${PlusImage} {
        opacity: 0.9;
      }
    `};
`;

export const BottomButtonText = styled.div`
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 15px;
  color: #161643;
  user-select: none;
`;

export const BlueBottomButtonText = styled.div`
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 15px;
  color: #385cf8;
  user-select: none;
`;

export const SignatureImg = styled.img`
  width: 132px;
  height: 68px;
  margin: 15px auto 18px;
`;

export const SignatureModalContent = styled.div`
  margin-top: 54px;
`;

export const SignatureModalButtonsWrapper = styled.div`
  margin: 44px auto 34px;
  width: fit-content;
  display: flex;
  flex-direction: column;

  & button:first-child {
    margin-bottom: 15px;
  }
`;

export const BottomButtonError = styled(ErrorMessage)`
  margin-top: -12px;
`;

export const BottomButtonWrapper = styled.div`
  margin-top: 43px;
`;

export const ModalButtonWrapper = styled.div`
  text-align: center;
  margin-bottom: 52px;
  margin-top: -20px;
`;

export const CenteredWrapper = styled.div`
  margin-top: 13%;
  text-align: center;
`;

export const ErrorText = styled.div`
  color: #ff2467;
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 35px;
  text-transform: uppercase;
  opacity: 0.5;
  margin-bottom: 10px;
`;

export const BottomSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: minmax(138px, auto);

  & > div {
    padding-bottom: 20px;
    display: flex;
    flex-direction: column;

    &:first-child {
      align-items: flex-start;
    }

    &:nth-child(2) {
      align-items: center;
    }

    &:nth-child(3) {
      align-items: flex-end;
    }
  }
`;

export const DocumentsPhotosContent = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  min-height: 250px;

  & > ${ModalButtonWrapper} {
    margin-top: auto;
  }
`;

export const DocumentPhotosWrapper = styled.div`
  text-align: center;
  margin: 20px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const DocumentPhoto = styled.img`
  max-width: 250px;
  margin-bottom: 20px;
  border-radius: 4px;
`;

export const DocumentInfo = styled.div`
  margin-top: 11px;
  color: #161643;
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 15px;
  margin-bottom: 22px;
`;

export const DeleteDocumentButtonWrapper = styled.div`
  margin-bottom: 44px;
`;

export const ScanModalOrText = styled.div`
  margin: 21px 0;
  text-align: center;
  font-family: ProximaNova-Light, sans-serif;
  font-size: 14px;
`;

export const SelectFileDragZoneContainer = styled.div`
  margin-top: 62px;
  display: flex;
  justify-content: center;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 15px;
  color: #161643;
  margin-bottom: 15px;
  height: 24px;

  & > img {
    transition: box-shadow 0.15s ease-in-out;
    height: 20px;
    width: 20px;
    margin-right: 8px;
    border-radius: 3px;
  }
`;

export const FileDragZone = styled.div`
  width: 283px;
  height: 191px;
  border: 1px dashed #385cf8;
  background-color: transparent;
  margin: 24px auto 10px;
  border-radius: 6px;
  transition: all 0.15s ease-in-out;
  box-sizing: border-box;
  cursor: pointer;
  padding: 10px;
  overflow-y: auto;
  user-select: none;

  &:focus {
    outline: none;
  }

  &:hover ${SelectFileDragZoneContainer} > img {
    box-shadow: 0 3px 3px #0f477734;
  }
`;

export const FileTypes = styled.div`
  font-family: ProximaNova-Light, sans-serif;
  font-size: 12px;
  color: #161643;
  margin-bottom: 24px;
`;

export const DragZoneText = styled.div`
  font-family: ProximaNova-Light, sans-serif;
  color: #385cf8;
  font-size: 16px;
`;

export const UploadedPDFWrapper = styled(FileDragZone)`
  display: flex;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 15px;
  color: #161643;
  word-break: break-all;
  align-items: center;
  text-align: center;
  border-style: solid;
  justify-content: center;
  cursor: default;
`;

export const UploadedImageWrapper = styled(UploadedPDFWrapper)`
  padding: 0;

  & > img {
    max-width: 100%;
    max-height: 100%;
  }
`;

type SelectAnotherFileButtonProps = {
  visible: boolean;
};

export const SelectAnotherFileButton = styled.button<SelectAnotherFileButtonProps>`
  display: flex;
  justify-content: center;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 15px;
  color: #161643;
  margin-bottom: 24px;
  padding: 4px 0;

  border: none;
  outline: none;
  background-color: transparent;
  cursor: pointer;
  user-select: none;
  visibility: ${(props) => !props.visible && 'hidden'};

  & > img {
    transition: box-shadow 0.15s ease-in-out;
    height: 20px;
    width: 20px;
    margin-right: 8px;
    border-radius: 3px;
  }

  &:hover > img {
    box-shadow: 0 3px 3px #0f477734;
  }
`;

export const ViewDocumentLink = styled.a`
  text-decoration: none;
  color: #385cf8;
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 300px;
  padding: 25px 20px;
  box-sizing: border-box;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 1;
  }
`;

export const SaveGuestText = styled.div`
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 16px;
  color: #161643;
  max-width: 300px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: default;
  padding: 20px;
`;

import styled from 'styled-components';
import Button from '../Button';
import {ModalButton} from '../../styled/common';

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

export const ModalContent = styled.div`
  position: relative;
  text-align: center;
`;

export const SelectFileInputZoneContainer = styled.label`
  cursor: pointer;
  display: flex;
  justify-content: center;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 15px;
  color: #161643;

  & > img {
    transition: box-shadow 0.15s ease-in-out;
    height: 20px;
    width: 20px;
    margin-right: 14px;
    border-radius: 3px;
    position: relative;
    top: -1px;
  }
`;

export const FileTypes = styled.div`
  font-family: ProximaNova-Light, sans-serif;
  font-size: 12px;
  color: #161643;
  margin-bottom: 24px;
`;

export const FileContent = styled.div`
  width: 283px;
  height: 191px;
  border: 1px dashed #385cf8;
  background-color: transparent;
  margin: 24px auto 10px;
  border-radius: 6px;
  transition: all 0.15s ease-in-out;
  box-sizing: border-box;
  padding: 10px;
  overflow-y: auto;
  user-select: none;

  &:focus {
    outline: none;
  }

  &:hover ${SelectFileInputZoneContainer} > img {
    box-shadow: 0 3px 3px #0f477734;
  }
`;

export const UploadedPDFWrapper = styled(FileContent)`
  position: relative;
  display: flex;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 15px;
  color: #161643;
  word-break: break-all;
  align-items: center;
  text-align: center;
  border-style: solid;
  justify-content: center;
`;

export const UploadedImageWrapper = styled(UploadedPDFWrapper)`
  position: relative;
  padding: 0;

  & > img {
    max-width: 100%;
    max-height: 100%;
  }
`;

export const ModalButtonStyled = styled(ModalButton)`
  margin-bottom: 0;
`;

export const CloseButton = styled(Button)`
  margin-bottom: 0;
  height: auto;
  position: absolute;
  box-shadow: initial;
  background: transparent;
  width: 13px;
  top: 7px;
  right: 7px;
  min-width: 0;
  padding: 0;

  & img {
    width: 15px;
  }
`;

export const UploadModalButtonsWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  margin-bottom: 38px;
  margin-top: 40px;
`;

export const InputZone = styled.div`
  display: flex;
  justify-content: center;
  width: 283px;
  background-color: transparent;
  margin: 25px auto;
  border-radius: 6px;
  transition: all 0.15s ease-in-out;
  box-sizing: border-box;
  padding: 10px;
  overflow-y: auto;
  user-select: none;

  &:focus {
    outline: none;
  }

  &:hover ${SelectFileInputZoneContainer} > img {
    box-shadow: 0 3px 3px #0f477734;
  }
`;

import styled from 'styled-components';
import Button from '../Button';
import {InputController} from '../Input';
import {Label as ButtonLabel} from '../Button/styled';
import {ErrorMessage} from '../../../styled/common';

export const CloseButton = styled.button`
  position: absolute;
  right: 19px;
  top: 16px;
  width: 36px;
  height: 38px;
  box-shadow: 0 10px 10px #2148ff1a;
  border-radius: 6px;
  text-align: center;
  outline: none;
  padding: 0;
  border: none;
  background-color: white;
  cursor: pointer;

  &:hover {
    opacity: 0.7;
  }

  &:active {
    opacity: 1;
  }

  & > img {
    height: 15px;
    vertical-align: middle;
  }
`;

export const TransferIcon = styled.img`
  width: 84px;
  height: 84px;
  margin-top: 45px;
  margin-bottom: 15px;
`;

export const DocumentsInfoContent = styled.main`
  text-align: left;
  color: #161643;
  max-width: 640px;
  margin: 0 auto 9px;
`;

export const DocumentsInfoTitle = styled.header`
  text-align: center;
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 21px;
`;

export const DocumentsInfoText = styled.div`
  font-family: ProximaNova-Light, sans-serif;
  font-size: 18px;
`;

export const Content = styled.div`
  min-width: 795px;
  min-height: 485px;
  box-sizing: border-box;
  padding: 0 75px 52px;
`;

const NextButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

export const NextButton = styled(Button)`
  min-width: 190px;
  min-height: 53px;

  & ${ButtonLabel} {
    justify-content: center;
    flex: 1;
  }
`;

export const DocumentsInfoNextButtonWrapper = styled(NextButtonWrapper)`
  margin-top: 30px;
`;

export const DocumentsVerificationTitle = styled.header`
  margin-top: 20px;
  margin-bottom: 25px;
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 21px;
  color: #161643;
  text-align: center;
`;

export const DocumentsVerificationSubtitle = styled.div`
  font-family: ProximaNova-Light, sans-serif;
  color: #161643;
  font-size: 18px;
  text-align: center;
`;

export const AccountDetailsContent = styled.main`
  margin-top: 45px;
  margin-bottom: 90px;
  min-width: 620px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-column-gap: 85px;
  align-items: flex-end;

  & ${ErrorMessage} {
    position: absolute;
    right: 0;
  }
`;

export const DocumentsVerificationNextButtonWrapper = styled(NextButtonWrapper)`
  margin-top: 90px;
`;

export const DocumentsUploadContent = styled.main`
  margin-top: 20px;
  margin-bottom: 90px;
  min-width: 620px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-column-gap: 85px;
  align-items: flex-end;

  & ${ErrorMessage} {
    position: absolute;
    right: 0;
  }
`;

export const FileInputWrapper = styled.div`
  margin-bottom: 15px;
`;

export const TwoButtonsWrapper = styled.div`
  display: flex;
  flex-direction: column;

  & > :first-child {
    margin-bottom: 20px;

    & > button {
      margin: auto;
    }
  }
`;

export const TaxesIcon = styled.img`
  width: 84px;
  height: 84px;
  margin-top: 40px;
  margin-bottom: 15px;
`;

export const SuccessTitle = styled.header`
  color: #161643;
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 21px;
  margin-bottom: 30px;

  & > img {
    height: 21px;
    width: 21px;
    margin-right: 5px;
    vertical-align: text-top;
  }
`;

export const SuccessText = styled.div`
  font-family: ProximaNova-Light, sans-serif;
  font-size: 18px;
  color: #161643;
  max-width: 448px;
  margin: 0 auto 40px;
  text-align: left;
`;

export const SwiftInput = styled(InputController)`
  .label {
    white-space: normal;
  }
`;

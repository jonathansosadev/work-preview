import styled, {css} from 'styled-components';
import Selectors from '../Selectors';
import Section from '../Section';
import CustomContractsList from '../CustomContractsList';
import {Label as InputWrapper} from '../Input/styled';
import TextareaAutosize from 'react-textarea-autosize';
import {inputStyles} from '../Input/styled';

export const Content = styled.div``;

export const Layout = styled.div`
  display: ${(props) => (props.hidden ? 'none' : 'flex')};
`;

export const Subsection = styled(Section)`
  padding: 0;
  margin: 25px 0 0;
  box-shadow: none;

  & .title {
    font-family: ProximaNova-Semibold, sans-serif;
    font-size: 16px;
  }
`;

export const ContractsTypeSelectors = styled(Selectors)`
  & > label {
    width: 128px;
    justify-content: center;
  }
`;

export const CustomContractsListStyled = styled(CustomContractsList)<{hidden?: boolean}>`
  margin-top: 30px;
  display: ${(props) => (props.hidden ? 'none' : 'block')};
`;

export const FormWrapper = styled.div`
  padding-right: 62px;
`;

export const ExtraInfoWrapper = styled.div`
  margin-left: 63px;
  margin-top: 30px;
`;

export const ExtraInfoSection = styled.div`
  margin-bottom: 29px;
`;

export const Divider = styled.div`
  width: 1px;
  background-color: #e2e7ef;
  margin: 30px 0 40px;
`;

export const AddBtnImg = styled.img`
  width: 20px;
  height: 20px;
  margin-right: 8px;
  transition: box-shadow 0.15s ease-in-out;
  border-radius: 3px;
`;

type AddBtnWrapperProps = {
  disabled?: boolean;
};
export const AddButton = styled.button<AddBtnWrapperProps>`
  display: flex;
  align-items: center;
  margin-bottom: 14px;
  cursor: pointer;
  outline: none;
  border: none;
  background-color: transparent;

  ${(props) =>
    props.disabled &&
    css`
      cursor: not-allowed;
      opacity: 0.3;
    `};

  ${(props) =>
    !props.disabled &&
    css`
      &:hover > ${AddBtnImg} {
        box-shadow: 0 3px 3px #0f477734;
      }

      &:active > ${AddBtnImg} {
        opacity: 0.95;
      }
    `};
`;

export const AddBtnText = styled.div`
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 15px;
  color: #161643;
  user-select: none;
`;

export const BtnIcon = styled.img`
  width: 13px;
  height: 15px;
  margin-right: 13px;
`;

export const ExtraClausesList = styled.div`
  display: flex;
  margin-left: 28px;
  flex-wrap: wrap;
`;

export const ExtraClauseItem = styled.div`
  display: flex;
  align-items: center;
  background-color: #f8f8f8;
  border-radius: 3px;
  padding: 7px 9px 7px 8px;
  margin-bottom: 5px;
  margin-right: 5px;
`;

export const ExtraClauseItemDocumentImg = styled.img`
  width: 12px;
  height: 15px;
  margin-right: 10px;
`;

export const ExtraClauseItemText = styled.div`
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 15px;
  color: #161643;
  user-select: none;
  margin-right: 17px;
`;

type RemoveExtraClauseButtonProps = {
  disabled?: boolean;
};
export const RemoveExtraClauseButton = styled.button<RemoveExtraClauseButtonProps>`
  width: 15px;
  height: 15px;
  cursor: pointer;
  transition: box-shadow 0.15s ease-in-out;
  border-radius: 3px;
  padding: 0;
  border: 0;
  outline: none;
  display: inline-flex;

  ${(props) =>
    props.disabled &&
    css`
      cursor: not-allowed;
      opacity: 0.3;
    `};

  ${(props) =>
    !props.disabled &&
    css`
      &:hover {
        box-shadow: 0 3px 3px #0f477734;
      }

      &:active {
        opacity: 0.95;
      }
    `};
`;

export const ExtraClauseInputWrapper = styled.div`
  margin-bottom: 25px;
  padding-left: 20px;

  & ${InputWrapper} {
    width: 555px;
  }
`;

export const ExtraClauseModalWrapper = styled.div`
  width: 600px;
  margin: 21px auto 0;
`;

export const ExtraClauseButtonsWrapper = styled.div`
  width: fit-content;
  margin: 60px auto 34px;

  & button:first-child {
    margin-bottom: 15px;
  }
`;

export const SignatureButtonsWrapper = styled.div`
  margin: 44px auto 34px;
  width: fit-content;
  display: flex;
  flex-direction: column;

  & button:first-child {
    margin-bottom: 15px;
  }
`;

export const SignatureImg = styled.img`
  width: 107px;
  height: 49px;
  margin: 6px 0 0 28px;
`;

export const ModalBtnLabel = styled.div`
  text-align: center;
  font-size: 16px;
  font-family: ProximaNova-Medium, sans-serif;
`;

export const SignatureModalContent = styled.div`
  margin-top: 54px;
`;

export const ExportSettingsButtonWrapper = styled.div`
  margin-top: 15px;

  & button {
    font-family: ProximaNova-Regular, sans-serif;
  }
`;

export const ExtraClauseDetails = styled(TextareaAutosize)`
  ${inputStyles}

  ${css`
    width: 555px;
    border: none;
    color: #8181a3;
    background-color: #f4f6f8;
    min-height: 200px
    &:hover {
      border: none;
    }
  `};
`;

export const ClauseTitleLabel = styled.div`
font-family: ProximaNova-Regular,sans-serif;
color: #161643;
font-size: 16px;
text-align: left;
user-select: none;
min-height: 20px;
box-sizing: border-box;
margin-bottom: 6px;
overflow-x: hidden;
white-space: nowrap;
text-overflow: ellipsis;
padding-left: 20px;
`;
import {LiveEditor} from 'react-live';
import styled, {css} from 'styled-components';
import {BASE_BLUE_COLOR} from '../../../styled/global';
import removeIcon from '../../../assets/remove.svg';
import Button from '../Button';
import Tooltip from '../Tooltip';
import Loader from '../../common/Loader';
import Section from '../Section';
import FormHeader from '../FormHeader';
import ModalButton from '../ModalButton';
import GenerateContractButton from '../GenerateContractButton';
import {InputController} from '../Input';
import {TextareaController} from '../Textarea';
import {BlueSmallLink, ACCOUNT_MAIN_WIDTH, ModalTwoButtonsWrapper} from 'styled/common';
import {Name} from '../Input/styled';

export const SectionWithoutExplicitStyles = styled(Section)`
  padding: 0;
  box-shadow: none;
`;

export const CustomContractHeader = styled(FormHeader)`
  grid-template-columns: max-content 1fr max-content;
  margin-top: -10px;
`;

export const Content = styled.div`
  max-width: ${ACCOUNT_MAIN_WIDTH}px;
  padding-bottom: 50px;
`;

export const SaveButton = styled(Button)`
  justify-content: center;
  width: 152px;
`;

export const SectionsContainer = styled.div`
  display: grid;
  grid-template-rows: auto;
  grid-gap: 40px;
  margin-top: 20px;
  margin-bottom: 40px;
  padding-bottom: 40px;
  border-bottom: 0.5px solid rgba(0, 66, 154, 0.2);
`;

export const TopSectionWrapper = styled.div`
  display: grid;
  grid-template-columns: minmax(250px, 525px) auto;
  column-gap: 50px;
  row-gap: 25px;
`;

export const ButtonSample = styled(GenerateContractButton)`
  min-width: 200px;
  height: 40px;
  justify-content: center;
  margin-top: 12px;
`;

export const ContractDetailsSection = styled(SectionWithoutExplicitStyles)`
  margin-top: 16px;
`;

export const ContractInputsContainer = styled.div`
  display: grid;
  grid-template-rows: auto;
  row-gap: 25px;
  margin-bottom: 20px;
`;

export const ContractDetailsInput = styled(InputController)`
  width: 100%;
  max-width: 293px;
`;

export const TextareaContainer = styled.div`
  position: relative;
  grid-area: 2 / 1 / 3 / 3;
  padding-top: 5px;
`;

export const SwitchContainer = styled.div`
  display: flex;
  position: absolute;
  top: 5px;
  right: 0;
  z-index: 2;
`;

export const SwitchButton = styled.button<{active: boolean}>`
  display: flex;
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 15px;
  color: ${BASE_BLUE_COLOR};
  padding-left: 23px;

  font-weight: ${(props) => props.active && 'bold'};
  color: ${(props) => props.active && '#161643'};

  &:first-child {
    padding-right: 23px;
    border-right: 1px solid #e2e7ef;
  }
`;

export const TooltipStyled = styled(Tooltip)`
  top: -2px;
  margin-left: 8px;
  font-weight: initial;
`;

export const ContractDetailsTextarea = styled(TextareaController)`
  margin-bottom: -2px;

  .text-area {
    box-sizing: border-box;
    min-height: 270px;
    padding: 12px 14px;
    border: 1px solid #161643;
    border-radius: 5px;
    resize: vertical;
  }
`;

export const EditorContainer = styled.div`
  max-width: ${ACCOUNT_MAIN_WIDTH}px;
  margin-top: 17px;
  border-radius: 5px;
  overflow: hidden;
`;

export const LiveEditorStyled = styled(LiveEditor)`
  min-height: 270px;
  resize: vertical;
`;

export const MessageText = styled.div`
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 16px;
`;

export const VariablesSection = styled.div`
  position: relative;
  display: grid;
  grid-template-rows: min-content min-content auto;
  row-gap: 12px;
  margin-top: 20px;
`;

export const VariablesTitle = styled.div`
  display: flex;
`;

export const VariablesDescription = styled.div`
  display: flex;
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 16px;
  color: #6b6b95;
  padding-bottom: 5px;
`;

export const VariablesTitleText = styled.span`
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 16px;
`;

export const VariablesTooltip = styled(Tooltip)`
  margin-left: 6px;

  .content {
    transform: translateY(5%);
  }
`;

export const VariablesList = styled.div`
  display: flex;
  flex-direction: column;
  height: 290px;
  overflow-y: scroll;
`;

export const VariablesItem = styled(BlueSmallLink)<{disabled?: boolean}>`
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 15px;
  margin-bottom: 10px;
  color: ${BASE_BLUE_COLOR};

  ${(props) =>
    props.disabled &&
    css`
      opacity: 0.5;
      cursor: default;
    `}
  &:hover {
    color: #001ead;
  }
`;

export const VariableTooltip = styled(Tooltip)<{disabled?: boolean}>`
  display: inline-block;
  margin-left: 6px;
  position: static;

  & .tooltip_trigger {
    letter-spacing: 2px;
    font-family: ProximaNova-Bold, sans-serif;
  }

  & .content {
    top: 30%;
    left: 20px;
  }

  ${(props) =>
    props.disabled &&
    css`
      opacity: 0.5;
      cursor: default;
    `}
`;

export const SelectPropertyButton = styled(ModalButton)`
  width: max-content;
  font-size: 15px;
`;

export const BottomSaveButton = styled(Button)`
  justify-content: center;
  width: 190px;
  height: 53px;
`;

export const SelectedPropsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, 220px);
  grid-auto-rows: 38px;
  gap: 10px;
  margin-bottom: 30px;
`;

export const SelectedPropItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 3px 8px;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 16px;
  background-color: #f0f0f8;
  border: 1px solid #acacd5;
  border-radius: 4px;
  margin: 5px;
`;

export const SelectedPropText = styled.span`
  overflow-x: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: default;
`;

export const TinyDeleteBtn = styled.button`
  width: 15px;
  min-width: 15px;
  height: 15px;
  background: #9696b9 url(${removeIcon}) no-repeat 50%/100%;
  border-radius: 3px;
`;

export const OrSelectText = styled.span`
  margin-bottom: 25px;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 16px;
`;

export const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  height: 21px;
  margin-bottom: 18px;
`;

export const Label = styled(Name)`
  margin-bottom: -11px;
`;

export const ErrorMessageInput = styled.div`
  text-align: right;
  font-family: ProximaNova-Semibold, sans-serif;
  color: #ff2467;
  font-size: 14px;
  margin-top: 3px;
`;

export const LoaderStyled = styled(Loader)`
  display: block;
  margin: 150px auto 0;
  width: 100px;
`;

export const ModalTwoButtonsWrapperStyled = styled(ModalTwoButtonsWrapper)`
  margin: 0 auto 40px;
  height: auto;
`;

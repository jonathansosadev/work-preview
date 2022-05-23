import styled from 'styled-components';
import Button from '../Button';
import Tooltip from '../Tooltip';
import ModalButton from '../ModalButton';
import FileInputButton from '../FileInputButton';
import {FileInputText} from '../FileInputButton/styled';
import Section from '../Section';
import {BaseButton} from '../../../styled/common';

export const Content = styled.div`
  display: grid;
  grid-template-columns: 360px 1fr;
  grid-auto-flow: column;

  & > div:first-child {
    padding-right: 60px;
  }

  & > div:nth-child(2) {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 0 10px;
    padding-left: 70px;
  }

  & > div:nth-child(3) {
    padding-left: 10px;
  }
`;

export const DetailsSection = styled(Section)`
  margin-bottom: 59px;
  cursor: default;
`;

export const UndoButton = styled(Button)`
  min-width: auto;
  background: #eb2461;
  height: 24px;
  padding: 0 5px;
  border-radius: 4px;
  border: none;
  position: absolute;
  right: 10px;
  bottom: 10px;

  img {
    filter: brightness(0) invert(1);
    margin-right: 0;
  }
`;

export const FieldsWrapper = styled.div`
  border-right: 1px solid #f1f1f4;
  height: 260px;
  margin-bottom: 90px;
`;

export const FlexContainer = styled.div`
  display: flex;
`;

export const Name = styled.div`
  font-size: 16px;
  font-family: ProximaNova-Regular, sans-serif;
`;

export const PasswordInput = styled.input`
  border: none;
  background: transparent;
  font-size: 30px;
  letter-spacing: 1px;
  width: 80px;
  padding-left: 5px;
`;

export const ChangePasswordFlexContainer = styled(FlexContainer)`
  align-items: center;
`;

export const ChangePasswordButtonWrapper = styled.div`
  text-align: left;

  & > ${UndoButton} {
    margin-left: auto;
  }
`;

export const ChangePasswordButton = styled(BaseButton)`
  font-size: 15px;
  color: #002cfa;
  margin-left: 45px;
  padding: 10px 0;
  font-family: ProximaNova-Medium, sans-serif;
`;

export const PasswordFlexContainer = styled(FlexContainer)`
  align-items: center;
  height: 37px;
`;

export const FieldWrapper = styled.div`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const LogoContent = styled.section`
  display: flex;
  flex-direction: column;
  max-width: 264px;
  margin-right: auto;
`;

export const LogoTitle = styled.div`
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 17px;
  font-weight: bold;
  color: black;
  margin-bottom: 15px;
`;

export const LogoContainer = styled.div<{whiteBg?: boolean}>`
  box-sizing: border-box;
  position: relative;
  height: 90px;
  width: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 5px;
  background-color: ${(props) => (props.whiteBg ? 'white' : '#f0f0fa')};
  border: 0.5px solid #161643;
  border-radius: 6px;
`;

export const LogoDetails = styled.div`
  display: flex;
  justify-content: space-between;
  font-family: ProximaNova-Regular, sans-serif;
  color: #161643;
  font-size: 11px;
  margin-bottom: 15px;
  width: 100%;
  & div:first-child {
    margin-right: 50px;
  }
`;

export const AddLogoFileInput = styled(FileInputButton)`
  justify-content: center;
  min-width: 114px;
  background: #2148ff;
  color: white;
  padding: 0 30px;
  width: 100%;

  ${FileInputText} {
    margin-left: 0;
  }
`;

export const LogoPlaceholder = styled.div`
  font-size: 28px;
  width: 226px;
  height: 58px;
  color: #9696b9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ProximaNova-Semibold, sans-serif;
`;

export const CustomLogoImage = styled.img`
  max-height: 100%;
  max-width: 100%;
`;

export const LogoButtonsWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;

  & > :first-child {
    margin-bottom: 15px;
  }
`;

export const Footer = styled.footer`
  display: grid;
  grid-template-rows: auto auto;
  row-gap: 10px;
  margin-top: 2px;
  width: fit-content;
`;

export const AccountType = styled.div`
  font-family: ProximaNova-Regular, sans-serif;
  color: #161643;
  display: flex;
  font-size: 17px;
  margin-bottom: 20px;

  span {
    padding-left: 5px;
    font-weight: bold;
  }
`;

export const AccountTypeTooltip = styled(Tooltip)`
  margin-left: 5px;
`;

export const LogoutButton = styled(Button)`
  min-width: 136px;
  width: auto;
`;

export const DeleteAccountButton = styled(Button)`
  min-width: 151px;
  width: auto;
`;

export const DeleteAccountModalButton = styled(ModalButton)`
  border-color: #ff2467;

  &:hover {
    background-color: #ff2467;
    border-color: #ff2467;
  }
`;

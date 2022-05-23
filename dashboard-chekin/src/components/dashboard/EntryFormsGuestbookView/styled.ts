import styled, {css} from 'styled-components';
import Button from '../Button';
import {ModalTwoButtonsWrapper as BaseModalTwoButtonsWrapper} from '../../../styled/common';
import FormHeader from '../FormHeader';

export const GuestBookFormHeader = styled(FormHeader)`
  margin-top: 27px;
  grid-template-columns: 0.5fr 1fr 0.5fr;

  & > :last-child {
    justify-self: flex-start;
  }
`;

export const HeadingButton = styled.button`
  outline: none;
  border: none;
  background: transparent;
  height: 30px;
  cursor: pointer;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 15px;
  padding: 1px 0 0 0;
  display: inline-flex;
  vertical-align: middle;
  color: #161643;

  &:hover > img {
    box-shadow: 0 3px 3px #0f477734;
  }

  &:active > img {
    opacity: 0.95;
  }

  & > img {
    border-radius: 3px;
    height: 20px;
    width: 20px;
    margin-right: 8px;
    transition: box-shadow 0.15s ease-in-out;
  }

  ${(props) =>
    props.disabled &&
    css`
      opacity: 0.2;
      cursor: not-allowed;

      &:hover > img {
        box-shadow: none;
      }

      &:active > img {
        opacity: 0.2;
      }
    `};
`;

export const Content = styled.div`
  display: grid;
  grid-template-columns: 0.5fr 1fr 0.5fr;
  grid-template-rows: 1fr;
  grid-auto-flow: column;
  margin-top: 50px;
`;

export const HousingsList = styled.section`
  text-align: right;
  display: grid;
`;

export const HousingsListTitle = styled.header`
  font-family: ProximaNova-Bold, sans-serif;
  text-transform: uppercase;
  color: #161643;
  font-size: 10px;
  margin-bottom: 18px;
`;

export const HousingListItemsWrapper = styled.div`
  max-height: 400px;
  overflow-y: auto;
`;

export const HousingListItemWrapper = styled.div`
  padding-right: 23px;
`;

type HousingListItemProps = {
  active?: boolean;
};
export const HousingListItem = styled.button<HousingListItemProps>`
  background-color: white;
  outline: none;
  border: none;
  cursor: pointer;
  font-size: 15px;
  font-family: ProximaNova-Medium, sans-serif;
  color: #9696b9;
  border-bottom: 1px solid transparent;
  margin-bottom: 17px;
  padding: 0;

  &:hover {
    border-color: #9696b9;
  }

  &:active {
    color: #161643;
    border-color: #161643;
  }

  ${(props) =>
    props.active &&
    css`
      font-family: ProximaNova-Bold, sans-serif;
      color: #161643;
      border-bottom: 2px solid #161643;

      &:hover {
        border-color: #161643;
      }

      &:active {
        color: #161643;
        border-color: #161643;
      }
    `};
`;

export const ActionsSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

export const DownloadButton = styled(Button)`
  min-width: 154px;
  margin-bottom: 15px;
`;

export const ModalForm = styled.form`
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
`;

export const ModalText = styled.div`
  font-family: ProximaNova-Light, sans-serif;
  color: #161643;
  font-size: 16px;
  max-width: 244px;
  margin: 20px auto;
  box-sizing: border-box;
  text-align: center;
  cursor: default;
`;

export const ModalTwoButtonsWrapper = styled(BaseModalTwoButtonsWrapper)`
  margin-top: 35px;
  height: 95px;
  max-width: 275px;
`;

export const PDFWrapper = styled.div`
  text-align: center;
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 19px;
  color: #161643;
`;

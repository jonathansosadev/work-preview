import styled from 'styled-components';
import Section from '../Section';
import CopyLinkButton from '../CopyLinkButton';
import Loader from '../../common/Loader';
import Button from '../Button';
import {SendEmailBtnView} from '../SendEmailBtn';

export const TitleBlock = styled.div`
  font-size: 16px;
`;

export const ListDealsItems = styled.div`
  display: flex;
  row-gap: 20px;
  flex-wrap: wrap;
  margin: 25px 0 26.5px;

  & div:first-child {
    border-left: none;
    padding-left: 0;
  }
`;

export const HorizontalLine = styled.hr`
  border: none;
  border-top: 1px solid #505050;
  opacity: 0.2;
  margin: 35px 0;
`;

export const LoaderWrapper = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
`;

export const UpsellingLinkSection = styled(Section)`
  padding: 0;
  margin: 0;
  box-shadow: none;
`;

export const UpsellingDamageProtectionSubSection = styled(UpsellingLinkSection)`
  margin: 0;
`;

export const DamageNoticeButton = styled(Button)`
  height: 36px;
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 15px;
`;

export const ButtonGroup = styled.div`
  padding-top: 5px;
  display: flex;

  & button {
    min-width: auto;
    border-radius: 0;
    height: auto;
    & div {
      height: auto;
    }
  }
`;

export const CopyLinkButtonStyled = styled(CopyLinkButton)`
  border: none;
  display: flex;
  align-items: center;
  box-shadow: none;
  font-family: ProximaNova-Semibold, sans-serif;
  padding: 0 24px 0 0;
  height: 25px;

  & img {
    margin-right: 2px;
    position: relative;
    top: -3px;
  }

  &:hover {
    opacity: 0.7;
  }
`;

export const SendEmailButtonStyled = styled(SendEmailBtnView)`
  font-family: ProximaNova-Semibold, sans-serif;
  padding: 0 24px;
  box-shadow: none;

  border: none;
  border-left: 1px solid rgb(210 211 225);
  height: 25px;

  & img {
    width: 18px;
    height: 16.5px;
    margin-right: 6px;
    position: relative;
    top: -1px;
  }

  &:hover {
    opacity: 0.7;
  }

  &,
  &:hover,
  &:active {
    box-shadow: none;
  }
`;

export const LoaderStyled = styled(Loader)`
  display: flex;
  justify-content: center;
  font-size: 15px;

  & svg {
    position: relative;
    top: 3px;
  }
`;

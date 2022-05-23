import styled from 'styled-components';
import {device} from '../../styled/device';
import QuestionMarkButton from '../QuestionMarkButton';
import {CenteredWrapper, ErrorMessage} from '../../styled/common';

export const Form = styled.form`
  margin: 60px 0 35px;
  display: flex;
  align-items: center;
  flex-direction: column;

  @media (max-width: ${device.tablet}) {
    margin: 20px 0 -50px;
  }
  @media (min-width: 760px) and (max-width: 770px) {
    margin: 20px 0 -150px;
  }
`;

type FieldsProps = {
  rowsCount: number;
};

export const Fields = styled.div<FieldsProps>`
  display: grid;
  grid-auto-flow: column;
  grid-column-gap: 150px;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: repeat(${props => props.rowsCount}, auto);
  text-align: center;
  max-width: 778px;
  position: relative;

  & ${ErrorMessage} {
    position: absolute;
    right: 0;
  }

  @media (max-width: ${device.laptop}) {
    grid-column-gap: 84px;
  }

  @media (max-width: ${device.tablet}) {
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    display: flex;
  }
`;

export const SubmitButtonWrapper = styled.div`
  margin: 87px 0 35px;
`;

export const IncompleteDataModalButtonIcon = styled.img`
  width: 24px;
  height: 21px;
`;

export const IncompleteDataModalButtonWrapper = styled(CenteredWrapper)`
  margin-bottom: 67px;
`;

export const CheckboxWrapper = styled.div`
  max-width: 319px;
  margin: 60px auto -50px;

  @media (max-width: ${device.tablet}) {
    margin: 30px auto 0;
  }

  @media (max-width: ${device.mobileS}) {
    max-width: unset;
    margin-left: 10px;
  }
`;

export const TermsLink = styled.a`
  color: #1a8cff;
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 18px;
  text-decoration: none;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    opacity: 1;
  }
`;

export const ModalButtonWrapper = styled.div`
  text-align: center;
  margin-bottom: 52px;

  & > button {
    margin: auto;
  }
`;

export const FieldQuestionMarkButton = styled(QuestionMarkButton)`
  height: 22px;
  width: 22px;

  & > img {
    height: 16px;
    width: 8px;
  }

  &:active {
    opacity: 0.8;
  }
`;

export const TooltipTrigger = styled.div`
  position: relative;
  z-index: 2;
  padding-left: 5px;
`;

export const InvalidFileTypeError = styled.div`
  text-align: right;
  font-family: ProximaNova-Semibold, sans-serif;
  color: #ff2467;
  font-size: 14px;
`;

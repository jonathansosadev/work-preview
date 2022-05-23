import styled, {css} from 'styled-components';
import Tooltip from '../Tooltip';
import Section from '../Section';
import Button from '../Button';
import Textarea from '../Textarea';
import {Label as InputWrapper} from '../Input/styled';

export const AddButton = styled(Button)`
  &&& {
    min-height: 40px;
    min-width: 188px;
    display: flex;
    justify-content: center;
  }
  ${(props) =>
    props.disabled &&
    css`
      opacity: 0.1;
    `}
`;

export const AddAccountButton = styled(AddButton)`
  &&& {
    align-self: flex-end;
    min-height: 44px;
  }
`;

export const DeleteButton = styled.button`
  position: absolute;
  right: 0;
  cursor: pointer;
  outline: none;
  padding: 0;
  & > img {
    width: 36px;
    height: 36px;
    vertical-align: middle;
  }
  &:hover {
    opacity: 0.8;
  }
  &:active {
    opacity: 1;
  }
  ${(props) =>
    props.disabled &&
    css`
      opacity: 0.3;
      pointer-events: none;
    `};
`;

export const LockItemWrapper = styled.div`
  display: flex;
`;

export const Content = styled.main`
  margin-top: 30px;
  padding-top: 30px;
  border-top: 1px solid rgba(22, 22, 67, 0.2);
`;

export const AccountWrapper = styled.div`
  display: flex;
`;

export const AccountSelectWrapper = styled.div`
  margin-right: 20px;
`;

export const WrappedTooltip = styled(Tooltip)`
  margin-left: 10px;
`;

export const LocksSubHeader = styled.div`
  font-size: 16px;
  color: #161643;
  font-family: ProximaNova-Regular, sans-serif;
  margin-bottom: 30px;
`;

type LockWrapperProps = {
  isLoading?: boolean;
};

export const LockWrapper = styled.div<LockWrapperProps>`
  box-shadow: 0 0 10px #6fc2ff33;
  border-radius: 6px;
  padding: 13px 10px 13px 20px;

  & > div {
    margin-bottom: 6px;
  }

  & > div:last-child {
    margin-bottom: 0;
  }

  ${(props) =>
    props.isLoading &&
    css`
      cursor: progress;
      & ${InputWrapper} {
        opacity: 1;
      }
    `}
`;

export const DoorTitle = styled.div`
  font-family: ProximaNova-Semibold, sans-serif;
  word-break: break-all;
  font-size: 16px;
`;

export const FlexRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
`;

export const DoorType = styled.div`
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 15px;
  color: #9696b9;
`;
export const DoorFooter = styled.div`
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 12px;
  word-break: break-all;
`;

export const LocksLoaderWrapper = styled.div`
  margin: 0 auto;
`;

export const NoLocksMessage = styled.div`
  margin: 0 auto 25px;
  font-family: ProximaNova-Semibold, sans-serif;
  color: #161643;
  font-size: 18px;
  text-align: left;

  & > ${AddButton} {
    margin-top: 5px;
  }
`;

type PaginationContentProps = {
  hasPagination: boolean;
};

export const PaginationContent = styled.div<PaginationContentProps>`
  margin-top: -5px;
  min-height: 23px;
  position: relative;
`;

export const Dot = styled.div`
  width: 10px;
  height: 10px;
  background-color: #eeeeee;
  border-radius: 50%;
`;

export const ThreeDotsGroup = styled.div`
  display: flex;
  align-items: center;
  margin: 16px 0 33px;
  & ${Dot}:nth-child(2) {
    margin: 0 21px;
  }
`;

export const SectionStyled = styled(Section)`
  padding: 0;
  margin: 25px 0 0;
  box-shadow: none;
`;

export const InstructionSubsection = styled(SectionStyled)`
  margin-top: 25px;
  padding-top: 25px;
  border-top: 1px solid rgba(22, 22, 67, 0.2);
  border-radius: 0;
`;

export const TimingSubsection = styled(SectionStyled)`
  margin-bottom: 25px;
  & > div {
    font-size: 16px;
  }

  & > div:nth-child(2) {
    margin-top: 0;
  }
`;

export const TextareaStyled = styled(Textarea)`
  & > div {
    font-family: ProximaNova-Bold, sans-serif;
    margin-bottom: 25px;
  }

  & textarea {
    width: 570px !important;
    padding: 12px;
    font-family: ProximaNova-Medium, sans-serif;
    font-size: 16px;
  }
`;

export const LocksItems = styled.div`
  & > :last-child {
    margin-bottom: 30px;
  }

  & ${PaginationContent} {
    margin-bottom: 0;
  }
`;

export const Subtitle = styled.div`
  display: flex;
  column-gap: 10px;
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 16px;
  color: #6b6b95;
`;

export const EmailSwitchWrapper = styled.div`
  margin-bottom: 10px;
`;

import styled, {css} from 'styled-components';
import TableLoader from '../TableLoader';
import ResendEmailButton from './ResendEmailButton';
import {
  BaseTableWrapper,
  ResolveButton as BaseResolveButton,
} from '../../../styled/common';

export const Content = styled.div``;

export const GuestInfoContainer = styled.div`
  width: 100%;
  box-shadow: 0 0 7px #2699fb29;
  border-radius: 6px;
  padding-left: 15px;
`;

export const GuestInfoWrapper = styled.div`
  margin-top: 25px;

  & > ${GuestInfoContainer}:not(:last-child) {
    margin-bottom: 25px;
  }
`;

type GuestInfoHeaderProps = {
  expanded: boolean;
};

export const GuestInfoHeader = styled.div<GuestInfoHeaderProps>`
  height: 95px;
  display: grid;
  grid-template-columns: 0.2fr 0.1fr 0.8fr 0.1fr;
  grid-template-rows: 95px;
  align-items: center;
  margin-right: 40px;
  border-bottom: ${(props) => props.expanded && '1px solid #eaf0f6'};
`;

export const ExpandCollapseButton = styled.button`
  outline: none;
  border: none;
  cursor: pointer;
  background-color: white;
  height: 100%;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 1;
  }

  & > img {
    width: 18px;
    height: 18px;
  }
`;

type GuestNameProps = {
  pale?: boolean;
};

export const GuestName = styled.div<GuestNameProps>`
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 16px;
  cursor: pointer;
  height: 100%;
  display: flex;
  align-items: center;
  color: ${(props) => (props.pale ? '#9696B9' : '#161643')};

  &:hover + ${ExpandCollapseButton} {
    opacity: 0.8;
  }
`;

export const StatusContainer = styled.div`
  text-align: center;
  margin: 20px 0 19px;
  height: 59px;
`;

export const StatusHeader = styled.div`
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 10px;
  color: #161643;
  text-transform: uppercase;
`;

export const StatusDisplay = styled.div`
  font-family: ProximaNova-Semibold, sans-serif;
  color: #adadcc;
  font-size: 15px;
  text-align: left;
  margin-top: 7px;
`;

export const ResolveButton = styled(BaseResolveButton)`
  margin-top: 2px;
  margin-left: 0;
  padding-left: 0;
`;

export const DeleteGuestButton = styled.button`
  border: 1px solid rgb(229, 230, 238);
  background-color: white;
  cursor: pointer;
  width: 30px;
  height: 30px;
  outline: none;
  border-radius: 2px;

  & > img {
    width: 12px;
    height: 16px;
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

export const DeleteGuestButtonContainer = styled.div`
  text-align: right;
  margin-right: 20px;
`;

export const ButtonsWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  margin-bottom: 30px;
  margin-top: 65px;

  & button:first-child {
    margin-bottom: 15px;
  }
`;

export const StatusesList = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
`;

export const TableWrapper = styled(BaseTableWrapper)`
  margin: 20px auto 0;
  overflow: visible;
  & > table {
    & > thead > tr {
      & th:nth-child(1) {
        width: 30%;
        min-width: 60px;
        padding-left: 14px;
      }
    }

    & > tbody > tr {
      & td:nth-child(1) {
        font-family: ProximaNova-Bold, sans-serif;
        padding-left: 14px;
      }

      &:last-child {
        border-bottom: none;
      }
    }
  }
`;

export const RowErrorIcon = styled.img`
  margin-left: 5px;
  height: 11px;
`;

export const RowSuccessIcon = styled.img`
  position: relative;
  top: 1.5px;
  margin-left: 5px;
  height: 13.7px;
  width: 13.7px;
`;

export const ButtonLabelWrapper = styled.div`
  display: flex;
  align-items: center;
`;

export const DeleteButtonLabelIcon = styled.img`
  width: 12px;
  height: 16px;
  margin-right: 9px;
`;

export const DeleteButtonLabelText = styled.div`
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 15px;
`;

export const GuestTableLoaderWrapper = styled.tr`
  cursor: pointer;

  &&&:hover {
    background-color: white;
  }

  & > td {
    cursor: default;
    padding-left: 0;
  }
`;

export const GuestTableLoader = styled(TableLoader)`
  padding-top: 17px;
  padding-bottom: 12px;
`;

export const StatusCellContainer = styled.div`
  position: relative;
  cursor: pointer;

  & > div {
    display: inline-block;
    position: relative;
  }
`;

type StatusTooltipProps = {
  open: boolean;
};

export const StatusTooltip = styled.div<StatusTooltipProps>`
  position: absolute;
  width: 333px;
  padding: 38px 46px 38px 36px;
  box-sizing: border-box;
  box-shadow: 0 30px 30px #2148ff1a;
  background-color: white;
  border-radius: 6px;
  font-size: 16px;
  font-family: ProximaNova-Medium, sans-serif;
  z-index: 999;
  color: #161643;
  left: calc(100% + 10px);
  top: 0;
  cursor: default;
  transition: opacity 0.15s ease-in-out;
  opacity: ${(props) => (props.open ? 1 : 0)};
  pointer-events: ${(props) => !props.open && 'none'};
`;

export const StatusTitle = styled.div`
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 14px;
  color: #161643;
  margin-bottom: 8px;
`;

export const StatusText = styled.div`
  font-size: 14px;
  font-family: ProximaNova-Regular, sans-serif;
  color: #161643;
`;

export const ErrorText = styled.div`
  color: #fe2466;
`;

export const ResendEmailButtonStyled = styled(ResendEmailButton)`
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 14px;
  height: auto;
  width: auto;
  padding: 0 6px;
`;

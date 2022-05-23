import styled from 'styled-components';
import {Link} from 'react-router-dom';
import TableLoader from '../TableLoader';
import {BaseButton, BaseTableWrapper} from '../../../styled/common';

export const Heading = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const HeadingSection = styled.div`
  display: flex;
  align-items: center;

  & > div {
    margin-right: 30px;
  }
`;

export const TableWrapper = styled(BaseTableWrapper)`
  margin: 20px auto 0;
  padding-bottom: 28px;

  & > table {
    & > thead > tr {
      & th:nth-child(1) {
        width: 10%;
        min-width: 111px;
        padding: 0 28px;
        box-sizing: border-box;
        text-align: center;
      }

      & th:nth-child(3),
      & th:nth-child(4) {
        width: 22%;
        min-width: 60px;
      }
    }

    & > tbody > tr {
      & td:nth-child(1) {
        font-family: ProximaNova-Bold, sans-serif;
        padding: 0 28px;
        text-align: center;
      }
    }
  }
`;

export const TableAddButton = styled.button`
  outline: none;
  border: none;
  background: transparent;
  padding: 0;
  height: 20px;
  cursor: pointer;
  transition: box-shadow 0.15s ease-in-out;
  border-radius: 3px;
  display: block;

  &:hover {
    box-shadow: 0 3px 3px #0f477734;
  }

  &:active {
    opacity: 0.95;
  }

  & > img {
    height: 20px;
    width: 20px;
  }
`;

export const HousingsTd = styled.td`
  &:nth-child(2) {
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 500px;
  }
`;

export const HeadingRefreshButton = styled.button`
  outline: none;
  border: none;
  background: transparent;
  height: 20px;
  cursor: pointer;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 15px;
  padding: 1px 0 0 16px;
  display: inline-flex;
  vertical-align: middle;
  width: 95px;

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
`;

export const PropertyTableHeader = styled.div`
  display: inline-flex;
  align-items: center;
`;

type InactiveRowProps = {
  hasBorder?: boolean;
};

export const InactiveRow = styled.tr<InactiveRowProps>`
  &&& {
    cursor: default;
    user-select: none;
    border: ${(props) => !props.hasBorder && 'none'};

    &:hover {
      background-color: white;
    }
  }
`;

type StatusTooltipProps = {
  open: boolean;
};

export const StatusTooltip = styled.div<StatusTooltipProps>`
  position: absolute;
  width: 220px;
  text-align: center;
  padding: 21px 0 28px;
  box-shadow: 0 10px 10px #2148ff1a;
  background-color: white;
  border-radius: 6px;
  font-size: 16px;
  font-family: ProximaNova-Medium, sans-serif;
  z-index: 999;
  color: #161643;
  left: calc(100% + 5px);
  top: 0;
  cursor: default;
  transition: opacity 0.15s ease-in-out;
  opacity: ${(props) => (props.open ? 1 : 0)};
  pointer-events: ${(props) => !props.open && 'none'};
`;

export const StatusCell = styled.div`
  position: relative;
  cursor: pointer;

  & > div {
    display: inline-block;
    position: relative;
  }
`;

export const StatusIcon = styled.img`
  width: 26px;
  height: 34px;
  margin-bottom: 7px;
  user-select: none;
`;

export const StatusText = styled.div`
  font-size: 16px;
  font-family: ProximaNova-Medium, sans-serif;
  color: #161643;
`;

export const HousingsTableLoader = styled(TableLoader)`
  padding-bottom: 20px;
`;

export const MappingNotification = styled.div`
  z-index: 10;
  position: fixed;
  right: 24px;
  bottom: 200px;
  width: 257px;
  padding: 12px 9px 14px 18px;
  box-shadow: 0 10px 10px #2148ff1a;
  border-radius: 3px;
  text-align: center;
  background-color: white;
`;

export const MappingNotificationText = styled.div`
  font-size: 13px;
  font-family: ProximaNova-Light, sans-serif;
  color: #161643;
  margin-bottom: 20px;
  text-align: left;
`;

export const MappingNotificationLink = styled(Link)`
  margin: 20px auto 0;
  font-size: 15px;
  font-family: ProximaNova-Medium, sans-serif;
  color: #385cf8;
`;

export const RefreshButtonLoaderWrapper = styled.div`
  margin-left: 5px;
  width: inherit;
`;

export const Form = styled.form`
  text-align: center;
`;

export const FormItemWrapper = styled.div`
  margin: 57px 28px 62px;
  min-height: 68px;
`;

export const ImportPropertiesButton = styled(BaseButton)`
  color: #002cfa;
  display: inline-flex;
  align-items: center;
  padding: 10px;
  margin-right: 30px;
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 15px;

  > img {
    margin-right: 10px;
  }
`;

export const HeaderButtonsWrapper = styled.div`
  display: flex;
  align-items: center;
`;

export const AddPropertyIcon = styled.img`
  height: 24px;
  width: 26px;
  position: relative;
  top: 1px;
`;

export const IndexCell = styled.div`
  font-family: ProximaNova-Medium, sans-serif;
`;

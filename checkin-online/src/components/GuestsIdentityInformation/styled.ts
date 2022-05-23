import styled from 'styled-components';
import TableLoader from '../TableLoader';
import {OriginalButton} from '../Button';
import {BaseTableWrapper} from '../../styled/common';
import Loader from '../Loader';

export const Title = styled.h1`
  font-family: ProximaNova-Bold, sans-serif;
  text-align: center;
  font-size: 25px;
`;

export const CounterGuestsTitle = styled.div`
  font-family: ProximaNova-Regular, sans-serif;
  text-align: center;
  font-size: 30px;
  margin: 45px 0;
`;

export const ImageGuests = styled.img`
  display: block;
  margin: 0 auto;
  width: 167.6px;
  height: 183px;
`;

export const LoaderStyled = styled(Loader)`
  display: flex;
  justify-content: center;
  padding: 200px 0;
`;

export const SubTitle = styled.h3`
  font-family: ProximaNova-Light, sans-serif;
  text-align: center;
  font-size: 16px;
  font-weight: lighter;
`;

export const HeaderPageContent = styled.div`
  margin: 45px auto 26px;
`;

export const GroupButtons = styled.div`
  display: flex;
  justify-content: center;
`;

type GuestNameProps = {
  pale?: boolean;
};
export const GuestName = styled.div<GuestNameProps>`
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 16px;
  height: 100%;
  display: flex;
  align-items: center;
  color: ${props => (props.pale ? '#9696B9' : '#161643')};
`;

export const GuestStatus = styled(GuestName)`
  display: flex;
  flex-wrap: wrap;
  column-gap: 23px;
  row-gap: 6px;
`;

export const TableWrapper = styled(BaseTableWrapper)`
  margin: 20px auto 40px;
  overflow: visible;
  & > table {
    & > thead > tr {
      & th:nth-child(1) {
        width: 50%;
        min-width: 60px;
        padding-left: 14px;
      }
    }
    & > tbody > tr {
      cursor: default;
      &:hover {
        background-color: initial;
      }
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
  height: 12px;
  width: 13px;
`;

export const RowSuccessIcon = styled.img`
  position: relative;
  top: 1.5px;
  margin-left: 5px;
  height: 13.7px;
  width: 13.7px;
`;

export const RetryButton = styled(OriginalButton)`
  padding: 3px 20px;
  min-width: 0;
  height: auto;
  & div {
    height: auto;
  }
`;

export const AddGuestButton = styled(OriginalButton)`
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 14px;
  padding: 8px 15px;
  margin: 13px 0;
  min-width: 0;
  height: auto;
  & div {
    height: auto;
  }
`;

export const ShareButton = styled(OriginalButton)`
  font-size: 16px;

  & img {
    width: 16px;
    height: 16px;
    position: relative;
    top: -1px;
  }
`;

export const ShareButtonWhatsApp = styled(ShareButton)`
  & img {
    width: 21px;
    height: 21px;
    margin-right: 7px;
  }
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

import styled, {css} from 'styled-components';
import {BaseTableWrapper} from '../../../styled/common';
import HeaderItem from '../HeaderItem';
import {ToggleWrapper} from '../HeaderItem/styled';

export const Heading = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

type TableWrapperProps = {
  hasLastRowBorder?: boolean;
};

export const TBodyTr = styled.tr<{isComplete: boolean}>`
  ${(props) =>
    props.isComplete &&
    css`
      background: #f8f8ff;
    `}
`;

export const TableWrapper = styled(BaseTableWrapper)<TableWrapperProps>`
  margin: 20px auto 0;
  overflow: visible;
  & > table {
    & > thead > tr {
      & th:nth-child(1) {
        padding: 0 14px;
      }

      & th:nth-child(3) {
        min-width: 105px;
      }

      & th:last-child {
        width: 35%;
      }
    }

    & > tbody > tr {
      & td:nth-child(1) {
        padding: 0 14px;
      }

      &:last-child {
        border-bottom: ${(props) => !props.hasLastRowBorder && 'none'};
      }
    }
  }
`;

export const TableHeader = styled.div`
  display: inline-flex;
  align-items: center;
  min-width: max-content;
  width: max-content;
  margin-right: 15px;
`;

export const TD = styled.td`
  &:nth-child(2) {
    div {
      padding: 0 20px 0 0;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    max-width: 300px;
  }
`;

export const HousingNameWrapper = styled.div`
  width: 200px;
  padding: 0 20px 0 0;
`
export const GuestNameWrapper = styled.div`
  max-width: 300px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  padding: 0 30px 0 0;
`

export const ActionSection = styled.div`
  display: flex;
  align-items: center;
`;

export const RefreshButtonLoaderWrapper = styled.div`
  margin-left: 5px;
  width: inherit;
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

export const ThreeDotsImg = styled.img`
  width: 20px;
  height: 20px;
`;

export const GuestsCell = styled.div`
  text-align: center;
`;

export const ReservationsHeaderItem = styled(HeaderItem)`
  ${ToggleWrapper} {
    padding: 10px 15px;
  }
`;

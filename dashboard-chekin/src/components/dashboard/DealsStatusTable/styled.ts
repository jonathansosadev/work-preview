import styled from 'styled-components';
import {BaseTableWrapper, ModalTwoButtonsWrapper} from '../../../styled/common';

export const StyledModalTwoButtonsWrapper = styled(ModalTwoButtonsWrapper)`
  margin-top: 85px;
`;

export const TableWrapper = styled(BaseTableWrapper)`
  margin: 32px auto 0;
  padding-bottom: 28px;

  & > table {
    & > thead > tr th {
      &:nth-child(1) {
        padding-left: 31px;
        box-sizing: border-box;
      }

      &:nth-child(6) {
        width: 25%;
      }
    }

    & > tbody {
      max-height: 240px;
      overflow-y: auto;

      > tr {
        cursor: default;

        & td {
          &:nth-child(1) {
            font-family: ProximaNova-Bold, sans-serif;
            padding-left: 31px;
            text-align: center;
          }

          &:nth-child(6) {
            text-align: right;
          }
        }

        &:hover {
          background-color: inherit;
        }
      }
    }
  }
`;

export const TableButtonsWrapper = styled.div`
  > * {
    margin-right: 5px;
    margin-top: 2px;
    margin-bottom: 2px;
  }
`;

export const Th = styled.th`
  box-sizing: border-box;
  &&:first-child {
    width: 15%;
  }
  &&:nth-child(2),
  &&:nth-child(3),
  &&:nth-child(6) {
    width: 16%;
    font-family: ProximaNova-Regular, sans-serif;
  }
  &:nth-child(4) {
    width: 10%;
  }
  &:nth-child(5) {
    width: 15%;
  }
`;

export const Td = styled.td`
  &&:first-child {
    text-align: left;
  }
  &:nth-child(2),
  &:nth-child(3) {
    padding-right: 10px;
  }
  font-family: ProximaNova-Regular, sans-serif;

  b {
    font-family: ProximaNova-Bold, sans-serif;
  }
`;

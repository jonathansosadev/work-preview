import styled from 'styled-components';
import {BaseTableWrapper} from '../../../styled/common';

export const TableWrapper = styled(BaseTableWrapper)`
  margin: 20px auto 0;

  & > table {
    & > thead > tr {
      & th:nth-child(1) {
        padding-left: 14px;
        width: 25%;
      }

      & th:nth-child(3) {
        min-width: 105px;
      }

      & th:last-child {
        width: 55%;
      }
    }

    & > tbody > tr {
      & td:nth-child(1) {
        padding-left: 14px;
      }

      &:last-child {
        border-bottom: none;
      }
    }
  }
`;

export const ButtonLabelIcon = styled.img`
  width: 15px;
  height: 14px;
  margin-right: 11px;
`;

export const NoInvoicesText = styled.td`
  font-size: 20px;
  margin: 27px 14px;
  font-family: ProximaNova-Bold, sans-serif;
  color: #161643;
`;

export const PDFButton = styled.button`
  outline: none;
  cursor: pointer;
  width: 68px;
  min-width: 61px;
  height: 28px;
  font-size: 14px;
  border: 1px solid #385cf8;
  border-radius: 2px;
  background-color: white;
  margin-left: auto;
  color: #002CFA;
  font-family: ProximaNova-Medium, sans-serif;

  &:hover {
    opacity: 0.78;
    box-shadow: 0 4px 4px #2148ff1a;
  }

  &:active {
    opacity: 1;
  }

  @keyframes blink {
    0% {
      border-color: #d7d8e4;
    }
    50% {
      border-color: #385cf8;
    }
    0% {
      border-color: #d7d8e4;
    }
  }

  @keyframes blink-backwards {
    0% {
      border-color: #385cf8;
    }
    50% {
      border-color: #d7d8e4;
    }
    0% {
      border-color: #385cf8;
    }
  }
`;

export const LoaderWrapper = styled.div`
  margin-top: 30px;
`;

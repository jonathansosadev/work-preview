import styled from 'styled-components';
import {
  BaseTableWrapper,
} from '../../../styled/common';


export const Content = styled.div``;

export const Title = styled.span`
    font-size: 15px;
    font-family: ProximaNova-Bold,sans-serif;
    color: #161643;
    font-weight: bold;
`;

export const ItemList = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 10px 0 7px 10px;
    border-bottom: 1px solid rgb(237 237 240);
`
export const List = styled.div`
    margin-top: 10px;
`
export const Amount = styled.div`
    font-weight:bold;
`
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
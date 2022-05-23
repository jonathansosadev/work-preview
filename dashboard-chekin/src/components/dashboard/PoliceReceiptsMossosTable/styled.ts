import styled from 'styled-components';
import Button from '../Button';
import {BaseTableWrapper} from '../../../styled/common';

export const Heading = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const DownloadAllButton = styled(Button)`
  min-width: 151px;
`;

type TableWrapperProps = {
  hasLastRowBorder?: boolean;
};

export const TableWrapper = styled(BaseTableWrapper)<TableWrapperProps>`
  margin: 20px auto 0;

  & > table {
    & > thead > tr {
      & th:nth-child(1) {
        padding-left: 14px;
      }

      & th:nth-child(3) {
        width: 36%;
        min-width: 60px;
      }

      & th:nth-child(4) {
        width: 25%;
      }
    }

    & > tbody > tr {
      cursor: default;

      & td:nth-child(1) {
        padding-left: 14px;
      }

      &:last-child {
        border-bottom: ${(props) => !props.hasLastRowBorder && 'none'};
      }

      &:hover {
        background-color: inherit;
      }
    }
  }
`;

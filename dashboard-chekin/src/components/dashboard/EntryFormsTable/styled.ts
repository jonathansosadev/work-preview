import styled from 'styled-components';
import Button from '../Button';
import {BaseTableWrapper} from '../../../styled/common';

export const DocsLinkButton = styled.button`
  border: none;
  outline: none;
  background-color: transparent;
  color: #9696b9;
  font-size: 14px;
  font-family: ProximaNova-Medium, sans-serif;
  cursor: pointer;
  padding-left: 0;
  transition: all 0.15s ease-in-out;
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
      &:hover {
        background-color: #f7fbff;

        & ${DocsLinkButton} {
          color: #385cf8;
          opacity: 0.8;
        }
      }

      &:active ${DocsLinkButton} {
        opacity: 1;
      }

      & td:nth-child(1) {
        padding-left: 14px;
      }

      &:last-child {
        border-bottom: ${(props) => !props.hasLastRowBorder && 'none'};
      }
    }
  }
`;

export const Heading = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const EntryFormsButton = styled(Button)`
  min-width: 136px;
  margin-left: 10px;
`;

export const DirectDownloadIcon = styled.img`
  height: 14px;
  width: 18px;
`;

export const HeadingButtonsWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`;

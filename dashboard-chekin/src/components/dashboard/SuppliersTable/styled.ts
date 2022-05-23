import styled from 'styled-components';
import CupOfTeaPlaceholder from '../CupOfTeaPlaceholder';
import {
  BaseButton,
  BaseTableWrapper,
  ModalTwoButtonsWrapper,
} from '../../../styled/common';

export const ContentWrapper = styled.div`
  margin: 26px auto 0;
`;

export const TableWrapper = styled(BaseTableWrapper)`
  padding-bottom: 28px;

  & > table {
    & > thead > tr th {
      &:nth-child(1) {
        padding-left: 31px;
        box-sizing: border-box;
      }

      &:nth-child(2) {
        width: 30%;
      }

      &:nth-child(3) {
        width: 40%;
      }
    }

    & > tbody {
      max-height: 240px;
      overflow-y: auto;

      > tr {
        &:last-child {
          cursor: default;

          &:hover {
            background-color: inherit;
          }
        }

        & td {
          &:nth-child(1) {
            font-family: ProximaNova-Semibold, sans-serif;
            padding-left: 31px;
          }

          font-family: ProximaNova-Regular, sans-serif;
        }
      }
    }
  }
`;

export const RowAddButton = styled(BaseButton)`
  width: 21px;
  height: 21px;
  background: linear-gradient(176deg, #385cf8 0%, #2148ff 100%);
  box-shadow: 0 3px 4px #00020334;
  border-radius: 4px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
`;

export const StyledModalTwoButtonsWrapper = styled(ModalTwoButtonsWrapper)`
  margin-top: -15px;
`;

export const LoaderWrapper = styled.div`
  margin-top: 80px;
`;

export const StyledCupOfTeaPlaceholder = styled(CupOfTeaPlaceholder)`
  margin-top: 70px;
`;

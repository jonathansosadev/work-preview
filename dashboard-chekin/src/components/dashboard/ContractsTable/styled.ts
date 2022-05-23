import styled from 'styled-components';
import Button from '../Button';
import {BaseTableWrapper} from '../../../styled/common';
import {
  DeleteGuestButton,
  ButtonLabelWrapper as BaseButtonLabelWrapper,
  ButtonsWrapper as BaseButtonsWrapper,
  DeleteButtonLabelIcon as BaseDeleteButtonLabelIcon,
  DeleteButtonLabelText as BaseDeleteButtonLabelText,
} from '../GuestInformationSection/styled';

export const Content = styled.div`
  max-width: 1040px;
  padding: 0 20px;
  margin: 20px auto 76px;
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

export const Heading = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const DownloadAllButton = styled(Button)`
  min-width: 151px;
`;

export const HeadingSection = styled.div`
  display: flex;
  align-items: center;

  & > div {
    margin-right: 10px;
  }
`;

export const DeleteContractButton = styled(DeleteGuestButton)``;

export const ButtonLabelWrapper = styled(BaseButtonLabelWrapper)``;

export const ButtonsWrapper = styled(BaseButtonsWrapper)``;

export const DeleteButtonLabelIcon = styled(BaseDeleteButtonLabelIcon)``;

export const DeleteButtonLabelText = styled(BaseDeleteButtonLabelText)``;

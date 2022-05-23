import React from 'react';
import {RelativeWrapper} from '../../../styled/common';
import {
  TableDivRow,
  TableModal,
  TableModalIcon,
  TableModalText,
  TableModalTitle,
} from './styled';

export const EMPTY_TABLE_ROWS_NUMBER = 9;

type TablePlaceholderProps = {
  isLoaderVisible: boolean;
  isInitiallyLoading: boolean;
  modalIconSrc: string;
  modalIconAlt: string;
  modalIconProps?: any;
  modalText?: string;
  modalTitle?: string;
  tableDataLength?: number;
  hidden?: boolean;
  children?: React.ReactNode | JSX.Element;
};

const defaultProps: Partial<TablePlaceholderProps> = {
  tableDataLength: 0,
  modalText: '',
  modalTitle: '',
  hidden: false,
  modalIconProps: {},
};

function TablePlaceholder({
  isLoaderVisible,
  tableDataLength,
  isInitiallyLoading,
  children,
  modalIconSrc,
  modalIconAlt,
  modalText,
  modalTitle,
  hidden,
  modalIconProps,
}: TablePlaceholderProps) {
  if (hidden) {
    return null;
  }

  return (
    <>
      {!isLoaderVisible && !tableDataLength && (
        <RelativeWrapper>
          <TableModal>
            <TableModalIcon src={modalIconSrc} alt={modalIconAlt} {...modalIconProps} />
            {modalTitle && <TableModalTitle>{modalTitle}</TableModalTitle>}
            {modalText && <TableModalText>{modalText}</TableModalText>}
            {children}
          </TableModal>
          {Array.from({length: EMPTY_TABLE_ROWS_NUMBER}).map((_, i) => {
            return <TableDivRow key={i} />;
          })}
        </RelativeWrapper>
      )}
      {!isInitiallyLoading &&
        Boolean(tableDataLength) &&
        tableDataLength! < EMPTY_TABLE_ROWS_NUMBER &&
        Array.from({length: EMPTY_TABLE_ROWS_NUMBER - tableDataLength!}).map((_, i) => {
          return <TableDivRow key={i} />;
        })}
    </>
  );
}

TablePlaceholder.defaultProps = defaultProps;
export {TablePlaceholder};

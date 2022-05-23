import styled from 'styled-components';
import Button from '../Button';
import Link from '../Link';
import {FieldsVerticalGridLayout} from '../../../styled/common';

export const OfferInfoGridLayout = styled(FieldsVerticalGridLayout)`
  max-height: 400px;
`;

export const TypeContainerWrapper = styled.div`
  margin-top: 20px;
  &::before {
    content: '• ';
  }
`;

export const ButtonActivateModal = styled(Button)`
  display: inline-block;
  height: auto;
  width: auto;
  padding: 0;
  margin: 0;
  font-family: ProximaNova-Semibold, sans-serif;

  & .label {
    height: auto;
  }
`;

export const SupplierLabel = styled.div`
  display: flex;
  justify-content: space-between;

  ${ButtonActivateModal} {
    font-size: 14px;
    pointer-events: initial;
    cursor: pointer;
  }
`;

export const TitleLink = styled(Link)`
  color: #002cfa;
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 14px;
  margin-left: 20px;

  &:hover {
    opacity: 0.7;
  }

  &:active {
    opacity: 1;
  }
`;

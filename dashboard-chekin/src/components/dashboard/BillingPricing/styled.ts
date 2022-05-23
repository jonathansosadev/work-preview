import styled from 'styled-components';
import Loader from '../../common/Loader';

export const PlanInfoPrice = styled.div`
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 16px;
  cursor: default;

  & > b {
    font-family: ProximaNova-Bold, sans-serif;
    font-weight: normal;
  }
`;

export const PaymentDetailsSection = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: 10px;
  margin-top: 10px;

  & b {
    font-family: ProximaNova-Semibold, sans-serif;
    font-weight: normal;
  }

  & span {
    font-family: ProximaNova-Regular, sans-serif;
  }
`;

export const TaxAndDiscount = styled(PaymentDetailsSection)`
  margin: 0;
`;

export const PriceDetail = styled.span`
  margin-top: 2px;
`;

export const StyledLoader = styled(Loader)`
  margin-top: 43px;
  justify-content: flex-start;
`;

export const BillingItemDetail = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  border-bottom: 1px solid #ccd9eb;
  margin-bottom: 10px
`;

export const CapitalizeDetail = styled.b`
  text-transform: capitalize
`;

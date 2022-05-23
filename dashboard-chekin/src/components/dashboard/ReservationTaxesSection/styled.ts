import styled from 'styled-components';
import StripeIdBlock from '../ReservationPayments/StripeIdBlock';

export const Main = styled.div`
  display: flex;
  margin-top: 7px;
  margin-bottom: 13px;
`;

export const Status = styled.div`
  color: #161643;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 16px;
`;

type StatusDotProps = {
  success: boolean;
};

export const StatusDot = styled.span<StatusDotProps>`
  margin-right: 10px;
  display: inline-block;
  border-radius: 100%;
  height: 7px;
  width: 7px;
  vertical-align: middle;
  background-color: ${(props) => (props.success ? '#35E5BC' : '#FFC400')};
`;

export const TotalPayment = styled.div`
  margin-right: 63px;
`;

export const Title = styled.div`
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 16px;
  color: #161643;
  padding-top: 16px;
  margin-bottom: 10px;
`;

export const PaymentAmount = styled.div`
  min-width: 230px;
  padding: 18px 39px;
  height: 93px;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 45px;
  color: #161643;
  border: 1px solid #eeeeee;
  border-radius: 5px;
  box-sizing: border-box;
  text-align: center;
  margin-bottom: 16px;
`;

export const Currency = styled.span`
  font-size: 38px;
`;

export const Summary = styled.div`
  padding-left: 63px;
  padding-top: 16px;
  color: #161643;
  border-left: 1px solid rgb(22 22 67 / 12%);
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 16px;
  align-self: stretch;
`;

export const SummaryTitle = styled.header`
  margin-bottom: 17px;
`;

export const SummaryRow = styled.div`
  margin-bottom: 13px;

  & > b {
    font-family: ProximaNova-Semibold, sans-serif;
    font-weight: normal;
  }
`;

export const StripeIdBlockStyled = styled(StripeIdBlock)`
  &&& {
    margin: 0;
    min-height: 20px;
  }
`;
